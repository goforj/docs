package docs

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/goforj/docs/internal/logger"
)

// GenerateCommand pulls repo READMEs and generates docs pages.
type GenerateCommand struct {
	logger *logger.AppLogger
}

// NewDocsGenerateCommand creates a new GenerateCommand.
func NewDocsGenerateCommand(logger *logger.AppLogger) *GenerateCommand {
	return &GenerateCommand{
		logger: logger,
	}
}

// Run executes the docs generator.
func (c *GenerateCommand) Run() error {
	repos := []RepoConfig{
		{
			Slug:       "collection",
			Title:      "Collections",
			CloneURL:   "https://github.com/goforj/collection.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "collection.md"),
		},
		{
			Slug:       "str",
			Title:      "Strings",
			CloneURL:   "https://github.com/goforj/str.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "strings.md"),
		},
		{
			Slug:       "httpx",
			Title:      "HTTPX",
			CloneURL:   "https://github.com/goforj/httpx.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "httpx.md"),
		},
		{
			Slug:       "execx",
			Title:      "ExecX",
			CloneURL:   "https://github.com/goforj/execx.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "execx.md"),
		},
		{
			Slug:       "godump",
			Title:      "GoDump",
			CloneURL:   "https://github.com/goforj/godump.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "godump.md"),
		},
		{
			Slug:       "env",
			Title:      "Env",
			CloneURL:   "https://github.com/goforj/env.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "env.md"),
		},
		{
			Slug:       "scheduler",
			Title:      "Scheduler",
			CloneURL:   "https://github.com/goforj/scheduler.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "scheduler.md"),
		},
		{
			Slug:       "queue",
			Title:      "Queue",
			CloneURL:   "https://github.com/goforj/queue.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "queue.md"),
		},
		{
			Slug:       "cache",
			Title:      "Cache",
			CloneURL:   "https://github.com/goforj/cache.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "cache.md"),
		},
		{
			Slug:       "crypt",
			Title:      "Crypt",
			CloneURL:   "https://github.com/goforj/crypt.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "crypt.md"),
		},
		{
			Slug:       "filesystem",
			Title:      "Filesystem",
			CloneURL:   "https://github.com/goforj/filesystem.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "filesystem.md"),
		},
	}

	docsRoot, err := findDocsRoot()
	if err != nil {
		return err
	}

	tempRoot := filepath.Join(os.TempDir(), "goforj-docs")
	for _, repo := range repos {
		repoDir := filepath.Join(tempRoot, repo.Slug)
		c.logger.Info().Any("repo", repo.Slug).Any("dir", repoDir).Msg("Cloning repo")
		if err := cloneRepo(repo.CloneURL, repoDir, repo.Branch); err != nil {
			return fmt.Errorf("clone %s: %w", repo.Slug, err)
		}

		readmePath := filepath.Join(repoDir, "README.md")
		readmeBytes, err := os.ReadFile(readmePath)
		if err != nil {
			return fmt.Errorf("read README for %s: %w", repo.Slug, err)
		}

		examples, err := loadExamplePrograms(filepath.Join(repoDir, "examples"))
		if err != nil {
			return fmt.Errorf("load examples for %s: %w", repo.Slug, err)
		}
		if err := writeExamplesManifest(repo, examples); err != nil {
			return fmt.Errorf("write examples manifest for %s: %w", repo.Slug, err)
		}

		rawBase := rawGithubBase(repo, repo.Branch)
		transformed := transformReadme(string(readmeBytes), repo, rawBase, examples)
		outputPath := filepath.Join(docsRoot, repo.OutputPath)
		if err := os.MkdirAll(filepath.Dir(outputPath), 0o755); err != nil {
			return fmt.Errorf("ensure output dir: %w", err)
		}
		if err := os.WriteFile(outputPath, []byte(transformed), 0o644); err != nil {
			return fmt.Errorf("write docs output: %w", err)
		}

		c.logger.Info().
			Any("repo", repo.Slug).
			Any("output", outputPath).
			Msg("Generated docs page")
	}

	return nil
}
