package http

import (
	"embed"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/goforj/docs/internal/logger"
	"github.com/labstack/echo/v4"
)

// staticTestSite provides flat pages, directory indexes, and assets in the production filesystem format.
//
//go:embed testdata/site
var staticTestSite embed.FS

// TestStaticDocumentationRoutes distinguishes published pages from nonexistent pages and assets.
func TestStaticDocumentationRoutes(t *testing.T) {
	previous := spas
	t.Cleanup(func() { spas = previous })
	spas = nil
	RegisterSpa("/*", "testdata/site", &staticTestSite)
	server := NewServer(logger.NewSilentLogger(), nil)
	e := echo.New()
	server.registerSinglePageApplications(e)
	for _, tc := range []struct {
		path   string
		status int
		body   string
	}{
		{"/", 200, "Home"}, {"/page", 200, "Page"}, {"/page/", 200, "Page"},
		{"/page.html", 200, "Page"}, {"/guide", 200, "Guide"}, {"/guide/", 200, "Guide"},
		{"/app.js", 200, "asset"}, {"/missing", 404, ""}, {"/missing/", 404, ""},
		{"/guide/missing", 404, ""}, {"/missing.js", 404, ""},
	} {
		t.Run(tc.path, func(t *testing.T) {
			for _, method := range []string{"GET", "HEAD"} {
				response := httptest.NewRecorder()
				e.ServeHTTP(response, httptest.NewRequest(method, tc.path, nil))
				if response.Code != tc.status {
					t.Fatalf("%s %s: got %d, want %d: %s", method, tc.path, response.Code, tc.status, response.Body.String())
				}
				if method == "GET" && tc.body != "" && !strings.Contains(response.Body.String(), tc.body) {
					t.Fatal(response.Body.String())
				}
				if tc.status == 404 && strings.Contains(response.Body.String(), "Home") {
					t.Fatal("unknown route served homepage")
				}
			}
		})
	}
}
