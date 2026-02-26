package docs

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"hash"
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

func loadExamplePrograms(examplesDir string, bypassCache bool) ([]ExampleProgram, error) {
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

	if !bypassCache {
		if cached, ok, err := loadCachedExamplePrograms(examplesDir, jobs); err != nil {
			return nil, err
		} else if ok {
			return cached, nil
		}
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
	_, _ = hasher.Write([]byte("examples-cache:content-hash\n"))
	hashRunnerSource(hasher)

	if err := hashDirectoryContents(hasher, examplesDir); err != nil {
		return "", err
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

func hashDirectoryContents(hasher hash.Hash, dir string) error {
	return filepath.WalkDir(dir, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() {
			return nil
		}

		name := entry.Name()
		// Ignore temporary files created by the docs runner if a previous run was interrupted.
		if name == "goforj_example.go" || name == "goforj_examples.work" {
			return nil
		}

		rel, relErr := filepath.Rel(dir, path)
		if relErr != nil {
			rel = path
		}
		b, readErr := os.ReadFile(path)
		if readErr != nil {
			return readErr
		}
		_, _ = hasher.Write([]byte(rel))
		_, _ = hasher.Write([]byte{0})
		_, _ = hasher.Write(b)
		_, _ = hasher.Write([]byte{0})
		return nil
	})
}

func hashRunnerSource(hasher hash.Hash) {
	for _, p := range []string{
		filepath.Join("internal", "docs", "examples.go"),
		filepath.Join("backend", "internal", "docs", "examples.go"),
	} {
		b, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		_, _ = hasher.Write([]byte("runner-source"))
		_, _ = hasher.Write([]byte{0})
		_, _ = hasher.Write([]byte(p))
		_, _ = hasher.Write([]byte{0})
		_, _ = hasher.Write(b)
		_, _ = hasher.Write([]byte{0})
		return
	}
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

	baseEnv := envWithoutVars(os.Environ(), "GOWORK", "GOFLAGS")

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	runWithEnv := func(env []string) error {
		stdout.Reset()
		stderr.Reset()
		cmd := exec.Command("go", "run", runTarget)
		cmd.Dir = dir
		cmd.Env = env
		cmd.Stdout = &stdout
		cmd.Stderr = &stderr
		return cmd.Run()
	}

	// Run with workspace mode disabled so local/parent go.work files do not affect docs generation.
	env := append(append([]string{}, baseEnv...), "GOWORK=off")
	err := runWithEnv(env)
	errOut := stderr.String()
	duration := int(time.Since(start).Milliseconds())
	if tempPath != "" {
		_ = os.Remove(tempPath)
	}
	out := stdout.String()
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

func envWithoutVars(env []string, names ...string) []string {
	if len(names) == 0 {
		return env
	}
	skip := map[string]struct{}{}
	for _, name := range names {
		skip[name] = struct{}{}
	}
	out := make([]string, 0, len(env))
	for _, kv := range env {
		name := kv
		if i := strings.IndexByte(kv, '='); i >= 0 {
			name = kv[:i]
		}
		if _, ok := skip[name]; ok {
			continue
		}
		out = append(out, kv)
	}
	return out
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
