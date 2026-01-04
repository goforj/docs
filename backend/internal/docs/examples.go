package docs

import (
	"bytes"
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

func loadExamplePrograms(examplesDir string) ([]ExampleProgram, error) {
	var examples []ExampleProgram

	if _, err := os.Stat(examplesDir); err != nil {
		if os.IsNotExist(err) {
			return examples, nil
		}
		return nil, err
	}

	type exampleJob struct {
		path       string
		exampleID  string
		rawCode    string
		normalized string
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

	return examples, nil
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

	runPath := mainPath
	tempPath := ""
	if hasIgnoreBuildTag(rawCode) {
		var err error
		tempPath, err = writeTempExample(dir, rawCode)
		if err != nil {
			return "", "", 1, 0, err
		}
		runPath = tempPath
	}

	cmd := exec.Command("go", "run", runPath)
	cmd.Dir = dir

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
