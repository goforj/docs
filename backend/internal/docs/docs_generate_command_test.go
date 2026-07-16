package docs

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestGeneratedPageMatches verifies cache reuse requires the output file to contain the current transformation.
func TestGeneratedPageMatches(t *testing.T) {
	t.Parallel()

	outputPath := filepath.Join(t.TempDir(), "console.md")
	if err := os.WriteFile(outputPath, []byte("current"), 0o644); err != nil {
		t.Fatalf("write generated page: %v", err)
	}
	if !generatedPageMatches(outputPath, "current") {
		t.Fatal("generatedPageMatches() = false, want true for current output")
	}
	if generatedPageMatches(outputPath, "stale") {
		t.Fatal("generatedPageMatches() = true, want false for stale output")
	}
	if generatedPageMatches(filepath.Join(t.TempDir(), "missing.md"), "current") {
		t.Fatal("generatedPageMatches() = true, want false for missing output")
	}
}

// TestResolveLocalSource verifies that local generation is explicit and limited to existing directories.
func TestResolveLocalSource(t *testing.T) {
	t.Parallel()

	if got, err := resolveLocalSource("", ""); err != nil || got != "" {
		t.Fatalf("resolveLocalSource() = %q, %v; want empty source", got, err)
	}
	if _, err := resolveLocalSource("", t.TempDir()); err == nil || !strings.Contains(err.Error(), "requires --repo") {
		t.Fatalf("resolveLocalSource() error = %v, want --repo requirement", err)
	}

	directory := t.TempDir()
	got, err := resolveLocalSource("str", directory)
	if err != nil {
		t.Fatalf("resolveLocalSource() error = %v", err)
	}
	want, err := filepath.Abs(directory)
	if err != nil {
		t.Fatalf("filepath.Abs() error = %v", err)
	}
	if got != want {
		t.Fatalf("resolveLocalSource() = %q, want %q", got, want)
	}

	file := filepath.Join(t.TempDir(), "README.md")
	if err := os.WriteFile(file, []byte("test"), 0o644); err != nil {
		t.Fatalf("write test file: %v", err)
	}
	if _, err := resolveLocalSource("str", file); err == nil || !strings.Contains(err.Error(), "not a directory") {
		t.Fatalf("resolveLocalSource() error = %v, want directory error", err)
	}
	if _, err := resolveLocalSource("str", filepath.Join(t.TempDir(), "missing")); err == nil {
		t.Fatal("resolveLocalSource() error = nil, want missing path error")
	}
}

// TestFingerprintRepoReadmeIncludesGeneratedPageConfig verifies cache invalidation follows every setting that changes generated output or its destination.
func TestFingerprintRepoReadmeIncludesGeneratedPageConfig(t *testing.T) {
	t.Parallel()

	repo := RepoConfig{
		Slug:       "queue",
		Title:      "Queue",
		CloneURL:   "https://github.com/goforj/queue.git",
		Branch:     "main",
		OutputPath: "libraries/queue.md",
		FrameworkGuide: FrameworkGuide{
			Title:   "Queues",
			Path:    "/async/queues",
			Summary: "Queue integration.",
		},
	}
	rawBase := "https://raw.githubusercontent.com/goforj/queue/main/"
	readme := []byte("# Queue\n")
	wantDifferentFrom := fingerprintRepoReadme(repo, rawBase, readme)

	tests := []struct {
		name   string
		mutate func(*RepoConfig)
	}{
		{name: "title", mutate: func(repo *RepoConfig) { repo.Title = "Queues" }},
		{name: "clone URL", mutate: func(repo *RepoConfig) { repo.CloneURL = "https://github.com/example/queue.git" }},
		{name: "output path", mutate: func(repo *RepoConfig) { repo.OutputPath = "queue.md" }},
		{name: "guide title", mutate: func(repo *RepoConfig) { repo.FrameworkGuide.Title = "Queue Apps" }},
		{name: "guide path", mutate: func(repo *RepoConfig) { repo.FrameworkGuide.Path = "/applications/queues" }},
		{name: "guide summary", mutate: func(repo *RepoConfig) { repo.FrameworkGuide.Summary = "Updated queue integration." }},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			changed := repo
			test.mutate(&changed)
			if got := fingerprintRepoReadme(changed, rawBase, readme); got == wantDifferentFrom {
				t.Fatalf("fingerprintRepoReadme() did not change after updating %s", test.name)
			}
		})
	}
}
