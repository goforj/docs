package http

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/goforj/docs/internal/logger"
	"github.com/labstack/echo/v5"
)

// TestServerHTTPCompatibility preserves routes, CORS, errors, and direct-peer identity through the complete middleware chain.
func TestServerHTTPCompatibility(t *testing.T) {
	t.Setenv("HTTP_CORS_ALLOW_ENDPOINTS", "https://goforj.dev")
	server := NewServer(logger.NewSilentLogger(), []RouteGroup{
		NewRouteGroup("/api", []Route{
			NewRoute(http.MethodGet, "/client", func(c *echo.Context) error {
				return c.String(http.StatusOK, c.RealIP())
			}),
			NewRoute(http.MethodGet, "/failure", func(c *echo.Context) error {
				return echo.NewHTTPError(http.StatusTeapot, "example failure")
			}),
			NewRoute(http.MethodGet, "/rejected", func(c *echo.Context) error {
				return c.String(http.StatusBadRequest, "rejected input")
			}),
		}),
	})
	e := server.bootstrap()

	for _, tc := range []struct {
		name   string
		method string
		path   string
		status int
		body   string
	}{
		{"peer identity", http.MethodGet, "/api/client", http.StatusOK, "192.0.2.10"},
		{"handler error", http.MethodGet, "/api/failure", http.StatusTeapot, ""},
		{"non-200 response", http.MethodGet, "/api/rejected", http.StatusBadRequest, "rejected input"},
		{"CORS preflight", http.MethodOptions, "/api/client", http.StatusNoContent, ""},
	} {
		t.Run(tc.name, func(t *testing.T) {
			request := httptest.NewRequest(tc.method, tc.path, nil)
			request.RemoteAddr = "192.0.2.10:12345"
			request.Header.Set("Origin", "https://goforj.dev")
			request.Header.Set("X-Forwarded-For", "198.51.100.99")
			request.Header.Set("X-Real-IP", "198.51.100.99")
			if tc.method == http.MethodOptions {
				request.Header.Set("Access-Control-Request-Method", http.MethodGet)
			}
			response := httptest.NewRecorder()
			e.ServeHTTP(response, request)
			if response.Code != tc.status {
				t.Fatalf("status = %d, want %d: %s", response.Code, tc.status, response.Body.String())
			}
			if tc.body != "" && response.Body.String() != tc.body {
				t.Fatalf("body = %q, want %q", response.Body.String(), tc.body)
			}
			if got := response.Header().Get("Access-Control-Allow-Origin"); got != "https://goforj.dev" {
				t.Fatalf("CORS origin = %q, want configured origin", got)
			}
		})
	}
}
