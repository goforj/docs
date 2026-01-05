package examples

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sync"

	"github.com/goforj/docs/internal/analytics"
	apphttp "github.com/goforj/docs/internal/http"
	"github.com/goforj/docs/internal/logger"
	"github.com/labstack/echo/v4"
)

// Controller provides example lookup and execution endpoints.
type Controller struct {
	logger  *logger.AppLogger
	tracker *analytics.Tracker
}

// NewController creates a new examples controller.
func NewController(logger *logger.AppLogger, tracker *analytics.Tracker) *Controller {
	return &Controller{
		logger:  logger,
		tracker: tracker,
	}
}

// Routes returns the routes for the controller.
func (c *Controller) Routes() []apphttp.Route {
	return []apphttp.Route{
		apphttp.NewRoute(apphttp.MethodGet, "/examples/:repo/:example", c.Show),
		apphttp.NewRoute(apphttp.MethodPost, "/examples/:repo/:example/run", c.Run),
	}
}

// Show returns example metadata and source.
func (c *Controller) Show(e echo.Context) error {
	repo := e.Param("repo")
	exampleID := e.Param("example")

	example, ok, err := getExample(repo, exampleID)
	if err != nil {
		c.logger.Error().Err(err).Msg("Failed to load example manifest")
		return e.JSON(http.StatusInternalServerError, map[string]string{
			"error": "example manifest unavailable",
		})
	}
	if !ok {
		return e.JSON(http.StatusNotFound, map[string]string{
			"error": "example not found",
		})
	}

	return e.JSON(http.StatusOK, ExampleDetailResponse{
		Repo:     repo,
		Example:  exampleID,
		Title:    example.Title,
		Language: example.Language,
		Code:     example.Code,
	})
}

// Run returns a recorded run output for the example.
func (c *Controller) Run(e echo.Context) error {
	repo := e.Param("repo")
	exampleID := e.Param("example")

	example, ok, err := getExample(repo, exampleID)
	if err != nil {
		c.logger.Error().Err(err).Msg("Failed to load example manifest")
		return e.JSON(http.StatusInternalServerError, map[string]string{
			"error": "example manifest unavailable",
		})
	}
	if !ok {
		return e.JSON(http.StatusNotFound, map[string]string{
			"error": "example not found",
		})
	}

	c.logger.Info().
		Any("repo", repo).
		Any("example", exampleID).
		Msg("Running example (recorded)")

	if c.tracker != nil && c.tracker.Enabled() {
		repoName := repo
		exampleName := exampleID
		clientIP := e.RealIP()
		userAgent := e.Request().UserAgent()
		go c.tracker.TrackExampleRun(context.Background(), repoName, exampleName, clientIP, userAgent)
	}

	return e.JSON(http.StatusOK, ExampleRunResponse{
		Stdout:     example.Stdout,
		Stderr:     example.Stderr,
		ExitCode:   example.ExitCode,
		DurationMs: example.DurationMs,
	})
}

// ExampleDetailResponse describes example metadata.
type ExampleDetailResponse struct {
	Repo     string `json:"repo"`
	Example  string `json:"example"`
	Title    string `json:"title"`
	Language string `json:"language"`
	Code     string `json:"code"`
}

// ExampleRunResponse describes example output.
type ExampleRunResponse struct {
	Stdout     string `json:"stdout"`
	Stderr     string `json:"stderr"`
	ExitCode   int    `json:"exitCode"`
	DurationMs int    `json:"durationMs"`
}

type exampleRecord struct {
	Title      string `json:"title"`
	Language   string `json:"language"`
	Code       string `json:"code"`
	Stdout     string `json:"stdout"`
	Stderr     string `json:"stderr"`
	ExitCode   int    `json:"exitCode"`
	DurationMs int    `json:"durationMs"`
}

type exampleStore map[string]map[string]exampleRecord

const exampleManifestEnvVar = "GOFORJ_EXAMPLES_MANIFEST"

var (
	storeOnce  sync.Once
	storeData  exampleStore
	storeError error
)

func getExample(repo string, exampleID string) (exampleRecord, bool, error) {
	storeOnce.Do(func() {
		storeData, storeError = loadExampleStore()
	})
	if storeError != nil {
		return exampleRecord{}, false, storeError
	}
	examples, ok := storeData[repo]
	if !ok {
		return exampleRecord{}, false, nil
	}
	example, ok := examples[exampleID]
	if !ok {
		return exampleRecord{}, false, nil
	}
	return example, true, nil
}

func loadExampleStore() (exampleStore, error) {
	path, err := resolveManifestPath()
	if err != nil {
		return nil, err
	}
	bytes, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read manifest: %w", err)
	}

	var store exampleStore
	if err := json.Unmarshal(bytes, &store); err != nil {
		return nil, fmt.Errorf("decode manifest: %w", err)
	}

	if store == nil {
		store = exampleStore{}
	}

	return store, nil
}

func resolveManifestPath() (string, error) {
	path := os.Getenv(exampleManifestEnvVar)
	if path == "" {
		path = filepath.Join(os.TempDir(), "goforj-docs", "examples.json")
	}
	if _, err := os.Stat(path); err != nil {
		return "", fmt.Errorf("examples manifest not found at %s", path)
	}
	return path, nil
}
