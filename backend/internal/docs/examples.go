package docs

import (
	"bytes"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
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
		stdout, stderr, exitCode, duration, err := runExample(path, rawCode)
		if err != nil {
			return fmt.Errorf("run example %s: %w", exampleID, err)
		}

		examples = append(examples, ExampleProgram{
			ID:         exampleID,
			Code:       rawCode,
			Normalized: normalized,
			Stdout:     stdout,
			Stderr:     stderr,
			ExitCode:   exitCode,
			DurationMs: duration,
		})

		return nil
	})

	if err != nil {
		return nil, err
	}

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
	if err != nil {
		exitCode := 1
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		}
		return stdout.String(), stderr.String(), exitCode, duration, nil
	}

	return stdout.String(), stderr.String(), 0, duration, nil
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
