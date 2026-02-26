package docs

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/gammazero/workerpool"
	"github.com/goforj/docs/internal/logger"
)

// GenerateCommand pulls repo READMEs and generates docs pages.
type GenerateCommand struct {
	Repo   string `name:"repo" help:"Only generate docs for a single repo slug (e.g. cache, queue, str)"`
	Fresh  bool   `name:"fresh" help:"Force fresh repo checkout and recompute examples (bypass example cache)"`
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
	}
	if c.Repo != "" {
		filtered := make([]RepoConfig, 0, 1)
		for _, repo := range repos {
			if repo.Slug == c.Repo {
				filtered = append(filtered, repo)
				break
			}
		}
		if len(filtered) == 0 {
			return fmt.Errorf("unknown repo %q", c.Repo)
		}
		repos = filtered
		c.logger.Info().Any("repo", c.Repo).Msg("Generating docs for filtered repo")
	}

	docsRoot, err := findDocsRoot()
	if err != nil {
		return err
	}

	tempRoot := filepath.Join(os.TempDir(), "goforj-docs")
	wp := workerpool.New(4)
	var errMu sync.Mutex
	var firstErr error

	setErr := func(err error) {
		if err == nil {
			return
		}
		errMu.Lock()
		if firstErr == nil {
			firstErr = err
		}
		errMu.Unlock()
	}

	for _, repo := range repos {
		repo := repo
		wp.Submit(func() {
			errMu.Lock()
			if firstErr != nil {
				errMu.Unlock()
				return
			}
			errMu.Unlock()

			repoDir := filepath.Join(tempRoot, repo.Slug)
			if c.Fresh {
				c.logger.Info().Any("repo", repo.Slug).Any("dir", repoDir).Msg("Removing cached repo for fresh run")
				if err := os.RemoveAll(repoDir); err != nil {
					setErr(fmt.Errorf("remove cached repo %s: %w", repo.Slug, err))
					return
				}
			}
			c.logger.Info().Any("repo", repo.Slug).Any("dir", repoDir).Msg("Syncing repo")
			action, err := cloneRepo(repo.CloneURL, repoDir, repo.Branch)
			if err != nil {
				setErr(fmt.Errorf("clone %s: %w", repo.Slug, err))
				return
			}
			c.logger.Info().Any("repo", repo.Slug).Any("action", action).Msg("Repo synced")

			readmePath := filepath.Join(repoDir, "README.md")
			readmeBytes, err := os.ReadFile(readmePath)
			if err != nil {
				setErr(fmt.Errorf("read README for %s: %w", repo.Slug, err))
				return
			}

			rawBase := rawGithubBase(repo, repo.Branch)
			transformed := transformReadme(string(readmeBytes), repo, rawBase)
			outputPath := filepath.Join(docsRoot, repo.OutputPath)
			if err := os.MkdirAll(filepath.Dir(outputPath), 0o755); err != nil {
				setErr(fmt.Errorf("ensure output dir for %s: %w", repo.Slug, err))
				return
			}
			if err := os.WriteFile(outputPath, []byte(transformed), 0o644); err != nil {
				setErr(fmt.Errorf("write docs output for %s: %w", repo.Slug, err))
				return
			}

			c.logger.Info().
				Any("repo", repo.Slug).
				Any("output", outputPath).
				Msg("Generated docs page")
		})
	}
	wp.StopWait()
	if firstErr != nil {
		return firstErr
	}

	return nil
}
