package docs

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

const exampleManifestEnvVar = "GOFORJ_EXAMPLES_MANIFEST"

type exampleManifestRecord struct {
	Title      string `json:"title"`
	Language   string `json:"language"`
	Code       string `json:"code"`
	Stdout     string `json:"stdout"`
	Stderr     string `json:"stderr"`
	ExitCode   int    `json:"exitCode"`
	DurationMs int    `json:"durationMs"`
}

type exampleManifest map[string]map[string]exampleManifestRecord

func writeExamplesManifest(repo RepoConfig, examples []ExampleProgram) error {
	storePath := manifestPath()
	store := exampleManifest{}

	if bytes, err := os.ReadFile(storePath); err == nil {
		_ = json.Unmarshal(bytes, &store)
	}

	if store[repo.Slug] == nil {
		store[repo.Slug] = map[string]exampleManifestRecord{}
	}

	for _, example := range examples {
		store[repo.Slug][example.ID] = exampleManifestRecord{
			Title:      example.ID,
			Language:   "go",
			Code:       example.Code,
			Stdout:     example.Stdout,
			Stderr:     example.Stderr,
			ExitCode:   example.ExitCode,
			DurationMs: example.DurationMs,
		}
	}

	payload, err := json.MarshalIndent(store, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal manifest: %w", err)
	}

	if err := os.MkdirAll(filepath.Dir(storePath), 0o755); err != nil {
		return fmt.Errorf("ensure manifest dir: %w", err)
	}

	if err := os.WriteFile(storePath, payload, 0o644); err != nil {
		return fmt.Errorf("write manifest: %w", err)
	}

	return nil
}

func manifestPath() string {
	if override := os.Getenv(exampleManifestEnvVar); override != "" {
		return override
	}
	return filepath.Join(os.TempDir(), "goforj-docs", "examples.json")
}
