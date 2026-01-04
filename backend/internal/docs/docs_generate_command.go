package docs

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/goforj/docs/internal/logger"
)

// DocsGenerateCommand pulls repo READMEs and generates docs pages.
type DocsGenerateCommand struct {
	logger *logger.AppLogger
}

// NewDocsGenerateCommand creates a new DocsGenerateCommand.
func NewDocsGenerateCommand(logger *logger.AppLogger) *DocsGenerateCommand {
	return &DocsGenerateCommand{
		logger: logger,
	}
}

// Run executes the docs generator.
func (c *DocsGenerateCommand) Run() error {
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
		if err := writeExamplesManifest(docsRoot, repo, examples); err != nil {
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
