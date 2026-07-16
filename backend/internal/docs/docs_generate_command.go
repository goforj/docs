package docs

import (
	"crypto/sha256"
	"encoding/hex"
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
	Source string `name:"source" type:"path" help:"Use a local repo checkout as the source (requires --repo)"`
	Fresh  bool   `name:"fresh" help:"Refresh remote input and bypass the generated-page cache"`
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
	localSource, err := resolveLocalSource(c.Repo, c.Source)
	if err != nil {
		return err
	}

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
			Slug:       "web",
			Title:      "Web",
			CloneURL:   "https://github.com/goforj/web.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "web.md"),
			FrameworkGuide: FrameworkGuide{
				Title:   "HTTP Services",
				Path:    "/applications/http-services",
				Summary: "Generated Apps register web routes and controllers through the HTTP runtime. Keep server wiring in framework providers and inject application services into controllers.",
			},
		},
		{
			Slug:       "execx",
			Title:      "ExecX",
			CloneURL:   "https://github.com/goforj/execx.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "execx.md"),
		},
		{
			Slug:       "console",
			Title:      "Console",
			CloneURL:   "https://github.com/goforj/console.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "console.md"),
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
			FrameworkGuide: FrameworkGuide{
				Title:   "Scheduler",
				Path:    "/async/scheduler",
				Summary: "Generated Apps register schedules in the scheduler runtime and inject the jobs they run. Keep recurring business work in jobs instead of the schedule registry.",
			},
		},
		{
			Slug:       "queue",
			Title:      "Queue",
			CloneURL:   "https://github.com/goforj/queue.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "queue.md"),
			FrameworkGuide: FrameworkGuide{
				Title:   "Queues",
				Path:    "/async/queues",
				Summary: "Generated Apps expose named queues through generated accessors. Dispatch jobs through those accessors and keep backend selection in queue configuration.",
			},
		},
		{
			Slug:       "events",
			Title:      "Events",
			CloneURL:   "https://github.com/goforj/events.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "events.md"),
			FrameworkGuide: FrameworkGuide{
				Title:   "Events",
				Path:    "/async/events",
				Summary: "Generated Apps expose named event buses through generated accessors. Publish through those accessors and keep driver selection in event configuration.",
			},
		},
		{
			Slug:       "mail",
			Title:      "Mail",
			CloneURL:   "https://github.com/goforj/mail.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "mail.md"),
			FrameworkGuide: FrameworkGuide{
				Title:   "Mail",
				Path:    "/applications/mail",
				Summary: "Generated Apps expose named mailers through generated accessors. Send through those accessors and keep transport selection and credentials in configuration.",
			},
		},
		{
			Slug:       "cache",
			Title:      "Cache",
			CloneURL:   "https://github.com/goforj/cache.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "cache.md"),
			FrameworkGuide: FrameworkGuide{
				Title:   "Cache Patterns",
				Path:    "/data/cache-patterns",
				Summary: "Generated Apps expose named caches through generated accessors. Use those accessors in application services and keep backend selection in cache configuration.",
			},
		},
		{
			Slug:       "crypt",
			Title:      "Crypt",
			CloneURL:   "https://github.com/goforj/crypt.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "crypt.md"),
		},
		{
			Slug:       "storage",
			Title:      "Storage",
			CloneURL:   "https://github.com/goforj/storage.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "storage.md"),
			FrameworkGuide: FrameworkGuide{
				Title:   "Storage Patterns",
				Path:    "/data/storage-patterns",
				Summary: "Generated Apps expose named disks through generated accessors. Use those accessors in application services and keep backend selection in storage configuration.",
			},
		},
		{
			Slug:       "wire",
			Title:      "Wire",
			CloneURL:   "https://github.com/goforj/wire.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "wire.md"),
			ReadmePath: "README.md",
			RepoName:   "wire",
		},
		{
			Slug:       "atlas",
			Title:      "Atlas",
			CloneURL:   "https://github.com/goforj/atlas.git",
			Branch:     "main",
			OutputPath: filepath.Join("libraries", "atlas.md"),
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
	fingerprintRoot := filepath.Join(tempRoot, ".docs-generate-fingerprints")
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
			if localSource != "" {
				repoDir = localSource
				c.logger.Info().Any("repo", repo.Slug).Any("dir", repoDir).Msg("Using local repo source")
			} else {
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
			}

			readmeRelativePath := repo.ReadmePath
			if readmeRelativePath == "" {
				readmeRelativePath = "README.md"
			}
			readmePath := filepath.Join(repoDir, filepath.FromSlash(readmeRelativePath))
			readmeBytes, err := os.ReadFile(readmePath)
			if err != nil {
				setErr(fmt.Errorf("read README %s for %s: %w", readmeRelativePath, repo.Slug, err))
				return
			}

			rawBase := rawGithubBase(repo, repo.Branch)
			transformed := transformReadme(string(readmeBytes), repo, rawBase)
			outputPath := filepath.Join(docsRoot, repo.OutputPath)
			fingerprint := fingerprintRepoReadme(repo, rawBase, readmeBytes)
			fingerprintPath := filepath.Join(fingerprintRoot, repo.Slug+".sha256")
			if !c.Fresh {
				prev, err := os.ReadFile(fingerprintPath)
				if err == nil && string(prev) == fingerprint && generatedPageMatches(outputPath, transformed) {
					c.logger.Info().
						Any("repo", repo.Slug).
						Any("fingerprint", shortFingerprint(fingerprint)).
						Msg("Skipped docs page (README unchanged)")
					return
				}
			}

			if err := os.MkdirAll(filepath.Dir(outputPath), 0o755); err != nil {
				setErr(fmt.Errorf("ensure output dir for %s: %w", repo.Slug, err))
				return
			}
			if err := os.WriteFile(outputPath, []byte(transformed), 0o644); err != nil {
				setErr(fmt.Errorf("write docs output for %s: %w", repo.Slug, err))
				return
			}
			if err := os.MkdirAll(fingerprintRoot, 0o755); err != nil {
				setErr(fmt.Errorf("ensure fingerprint dir for %s: %w", repo.Slug, err))
				return
			}
			if err := os.WriteFile(fingerprintPath, []byte(fingerprint), 0o644); err != nil {
				setErr(fmt.Errorf("write fingerprint for %s: %w", repo.Slug, err))
				return
			}

			c.logger.Info().
				Any("repo", repo.Slug).
				Any("fingerprint", shortFingerprint(fingerprint)).
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

// generatedPageMatches prevents a shared fingerprint cache from accepting stale output copied into a fresh build context.
func generatedPageMatches(outputPath string, transformed string) bool {
	output, err := os.ReadFile(outputPath)
	return err == nil && string(output) == transformed
}

// resolveLocalSource validates the explicit local checkout before worker goroutines begin generation.
func resolveLocalSource(repoSlug, source string) (string, error) {
	if source == "" {
		return "", nil
	}
	if repoSlug == "" {
		return "", fmt.Errorf("--source requires --repo")
	}

	absolute, err := filepath.Abs(source)
	if err != nil {
		return "", fmt.Errorf("resolve local source %q: %w", source, err)
	}
	info, err := os.Stat(absolute)
	if err != nil {
		return "", fmt.Errorf("read local source %q: %w", source, err)
	}
	if !info.IsDir() {
		return "", fmt.Errorf("local source %q is not a directory", source)
	}

	return absolute, nil
}

// fingerprintRepoReadme includes a transform version so importer fixes refresh unchanged upstream READMEs.
func fingerprintRepoReadme(repo RepoConfig, rawBase string, readme []byte) string {
	sum := sha256.New()
	_, _ = sum.Write([]byte("docs-generate-readme-fingerprint:v5\n"))
	for _, value := range []string{
		repo.Slug,
		repo.Title,
		repo.CloneURL,
		repo.Branch,
		repo.OutputPath,
		repo.ReadmePath,
		repo.RepoName,
		repo.FrameworkGuide.Title,
		repo.FrameworkGuide.Path,
		repo.FrameworkGuide.Summary,
		rawBase,
	} {
		_, _ = sum.Write([]byte(value))
		_, _ = sum.Write([]byte{0})
	}
	_, _ = sum.Write(readme)
	return hex.EncodeToString(sum.Sum(nil))
}

// shortFingerprint keeps generator logs readable while retaining enough hash material for diagnostics.
func shortFingerprint(value string) string {
	if len(value) <= 12 {
		return value
	}
	return value[:12]
}
