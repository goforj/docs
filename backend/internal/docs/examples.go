package docs

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/gammazero/workerpool"
)

// ExampleProgram represents a runnable example program.
type ExampleProgram struct {
	ID         string
	Code       string
	Normalized string
	Stdout     string
	Stderr     string
	ExitCode   int
	DurationMs int
}

type exampleJob struct {
	path       string
	exampleID  string
	rawCode    string
	normalized string
}

func loadExamplePrograms(examplesDir string) ([]ExampleProgram, error) {
	var examples []ExampleProgram

	if _, err := os.Stat(examplesDir); err != nil {
		if os.IsNotExist(err) {
			return examples, nil
		}
		return nil, err
	}

	var jobs []exampleJob

	err := filepath.WalkDir(examplesDir, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() || entry.Name() != "main.go" {
			return nil
		}

		codeBytes, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("read example %s: %w", path, err)
		}

		exampleID := filepath.Base(filepath.Dir(path))
		rawCode := string(codeBytes)
		normalized := normalizeCode(rawCode)
		jobs = append(jobs, exampleJob{
			path:       path,
			exampleID:  exampleID,
			rawCode:    rawCode,
			normalized: normalized,
		})

		return nil
	})

	if err != nil {
		return nil, err
	}

	if len(jobs) == 0 {
		return examples, nil
	}

	if cached, ok, err := loadCachedExamplePrograms(examplesDir, jobs); err != nil {
		return nil, err
	} else if ok {
		return cached, nil
	}

	wp := workerpool.New(10)
	var mu sync.Mutex
	var firstErr error
	var once sync.Once

	for _, job := range jobs {
		job := job
		wp.Submit(func() {
			stdout, stderr, exitCode, duration, err := runExample(job.path, job.rawCode)
			if err != nil {
				once.Do(func() {
					firstErr = fmt.Errorf("run example %s: %w", job.exampleID, err)
				})
				return
			}
			mu.Lock()
			examples = append(examples, ExampleProgram{
				ID:         job.exampleID,
				Code:       job.rawCode,
				Normalized: job.normalized,
				Stdout:     stdout,
				Stderr:     stderr,
				ExitCode:   exitCode,
				DurationMs: duration,
			})
			mu.Unlock()
		})
	}

	wp.StopWait()
	if firstErr != nil {
		return nil, firstErr
	}

	sort.Slice(examples, func(i, j int) bool {
		return examples[i].ID < examples[j].ID
	})

	if err := writeCachedExamplePrograms(examplesDir, jobs, examples); err != nil {
		return nil, err
	}

	return examples, nil
}

func loadCachedExamplePrograms(examplesDir string, jobs []exampleJob) ([]ExampleProgram, bool, error) {
	cachePath, err := exampleProgramsCachePath(examplesDir, jobs)
	if err != nil {
		return nil, false, err
	}
	b, err := os.ReadFile(cachePath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, false, nil
		}
		return nil, false, err
	}
	var examples []ExampleProgram
	if err := json.Unmarshal(b, &examples); err != nil {
		return nil, false, nil
	}
	return examples, true, nil
}

func writeCachedExamplePrograms(examplesDir string, jobs []exampleJob, examples []ExampleProgram) error {
	cachePath, err := exampleProgramsCachePath(examplesDir, jobs)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(cachePath), 0o755); err != nil {
		return err
	}
	b, err := json.Marshal(examples)
	if err != nil {
		return err
	}
	return os.WriteFile(cachePath, b, 0o644)
}

func exampleProgramsCachePath(examplesDir string, jobs []exampleJob) (string, error) {
	hasher := sha256.New()
	_, _ = hasher.Write([]byte("examples-cache:v1\n"))

	sortedJobs := append([]exampleJob(nil), jobs...)
	sort.Slice(sortedJobs, func(i, j int) bool {
		return sortedJobs[i].path < sortedJobs[j].path
	})
	for _, job := range sortedJobs {
		rel, err := filepath.Rel(examplesDir, job.path)
		if err != nil {
			rel = job.path
		}
		_, _ = hasher.Write([]byte(rel))
		_, _ = hasher.Write([]byte{0})
		_, _ = hasher.Write([]byte(job.rawCode))
		_, _ = hasher.Write([]byte{0})
	}

	// Include module manifests so dependency changes invalidate cached example output.
	repoRoot := filepath.Dir(examplesDir)
	for _, name := range []string{"go.mod", "go.sum", "go.work", "go.work.sum"} {
		b, err := os.ReadFile(filepath.Join(repoRoot, name))
		if err != nil {
			continue
		}
		_, _ = hasher.Write([]byte(name))
		_, _ = hasher.Write([]byte{0})
		_, _ = hasher.Write(b)
		_, _ = hasher.Write([]byte{0})
	}

	sum := hex.EncodeToString(hasher.Sum(nil))
	repoSlug := filepath.Base(repoRoot)
	return filepath.Join(os.TempDir(), "goforj-docs", "examples-cache", repoSlug+"-"+sum+".json"), nil
}

func normalizeCode(code string) string {
	normalized := strings.ReplaceAll(code, "\r\n", "\n")
	lines := strings.Split(normalized, "\n")
	for i := range lines {
		lines[i] = strings.TrimSpace(lines[i])
	}
	return strings.TrimSpace(strings.Join(lines, "\n"))
}

func runExample(mainPath string, rawCode string) (string, string, int, int, error) {
	start := time.Now()
	dir := filepath.Dir(mainPath)

	tempPath := ""
	runTarget := "."
	if hasIgnoreBuildTag(rawCode) {
		var err error
		tempPath, err = writeTempExample(dir, rawCode)
		if err != nil {
			return "", "", 1, 0, err
		}
	}

	cmd := exec.Command("go", "run", runTarget)
	cmd.Dir = dir
	if goworkPath, cleanup, err := writeTempExampleWorkspace(dir); err != nil {
		return "", "", 1, 0, err
	} else {
		if cleanup != nil {
			defer cleanup()
		}
		if goworkPath != "" {
			cmd.Env = append(os.Environ(), "GOWORK="+goworkPath)
		}
	}

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	duration := int(time.Since(start).Milliseconds())
	if tempPath != "" {
		_ = os.Remove(tempPath)
	}
	out := stdout.String()
	errOut := stderr.String()
	if strings.TrimSpace(errOut) != "" {
		if strings.TrimSpace(out) != "" && !strings.HasSuffix(out, "\n") {
			out += "\n"
		}
		out += errOut
		errOut = ""
	}
	out = filterGoDownloadNoise(out)

	if err != nil {
		exitCode := 1
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		}
		return out, errOut, exitCode, duration, nil
	}

	return out, errOut, 0, duration, nil
}

func writeTempExampleWorkspace(startDir string) (string, func(), error) {
	modRoots, err := findAncestorModuleRoots(startDir)
	if err != nil {
		return "", nil, err
	}
	if len(modRoots) < 2 {
		return "", nil, nil
	}

	var b strings.Builder
	b.WriteString("go 1.23\n\nuse (\n")
	for i := len(modRoots) - 1; i >= 0; i-- {
		b.WriteString("\t")
		b.WriteString(modRoots[i])
		b.WriteString("\n")
	}
	b.WriteString(")\n")

	workPath := filepath.Join(startDir, "goforj_examples.work")
	if err := os.WriteFile(workPath, []byte(b.String()), 0o644); err != nil {
		return "", nil, err
	}
	cleanup := func() { _ = os.Remove(workPath) }
	return workPath, cleanup, nil
}

func findAncestorModuleRoots(startDir string) ([]string, error) {
	var roots []string
	seen := map[string]bool{}
	dir, err := filepath.Abs(startDir)
	if err != nil {
		return nil, err
	}
	for {
		goModPath := filepath.Join(dir, "go.mod")
		if stat, err := os.Stat(goModPath); err == nil && !stat.IsDir() {
			if !seen[dir] {
				roots = append(roots, dir)
				seen[dir] = true
			}
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return roots, nil
}

func filterGoDownloadNoise(output string) string {
	if output == "" {
		return output
	}
	lines := strings.Split(output, "\n")
	filtered := make([]string, 0, len(lines))
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "go: downloading ") ||
			strings.HasPrefix(trimmed, "go: extracting ") ||
			strings.HasPrefix(trimmed, "go: finding ") ||
			strings.HasPrefix(trimmed, "go: found ") {
			continue
		}
		filtered = append(filtered, line)
	}
	return strings.TrimRight(strings.Join(filtered, "\n"), "\n")
}

func hasIgnoreBuildTag(code string) bool {
	lines := strings.Split(code, "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		if strings.HasPrefix(trimmed, "//go:build") || strings.HasPrefix(trimmed, "// +build") {
			if strings.Contains(trimmed, "ignore") {
				return true
			}
			continue
		}
		break
	}
	return false
}

func writeTempExample(dir string, rawCode string) (string, error) {
	lines := strings.Split(rawCode, "\n")
	var cleaned []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "//go:build") || strings.HasPrefix(trimmed, "// +build") {
			continue
		}
		cleaned = append(cleaned, line)
	}
	tempPath := filepath.Join(dir, "goforj_example.go")
	if err := os.WriteFile(tempPath, []byte(strings.Join(cleaned, "\n")), 0o644); err != nil {
		return "", err
	}
	return tempPath, nil
}
