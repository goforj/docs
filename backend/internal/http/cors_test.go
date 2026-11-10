package http

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/goforj/docs/internal/logger"
	"github.com/labstack/echo/v5"
)

// TestCorsOriginPolicy preserves public access without allowing wildcard credential sharing.
func TestCorsOriginPolicy(t *testing.T) {
	for _, tc := range []struct {
		name        string
		environment string
		endpoints   string
		origin      string
		allowOrigin string
		credentials string
	}{
		{"default public", "production", "", "https://example.com", "*", ""},
		{"explicit wildcard", "production", "*", "https://example.com", "*", ""},
		{"explicit origin", "production", "https://goforj.dev", "https://goforj.dev", "https://goforj.dev", "true"},
		{"unlisted origin", "production", "https://goforj.dev", "https://example.com", "", ""},
		{"development origin", "dev", "", "http://localhost:5173", "http://localhost:5173", "true"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			t.Setenv("APP_ENV", tc.environment)
			t.Setenv("HTTP_CORS_ALLOW_ENDPOINTS", tc.endpoints)
			server := NewServer(logger.NewSilentLogger(), nil)
			e := echo.New()
			server.registerCors(e)
			e.GET("/", func(c *echo.Context) error { return c.NoContent(http.StatusOK) })
			request := httptest.NewRequest(http.MethodGet, "/", nil)
			request.Header.Set("Origin", tc.origin)
			response := httptest.NewRecorder()
			e.ServeHTTP(response, request)
			if response.Code != http.StatusOK {
				t.Fatalf("status = %d, want 200", response.Code)
			}
			if got := response.Header().Get("Access-Control-Allow-Origin"); got != tc.allowOrigin {
				t.Fatalf("allow origin = %q, want %q", got, tc.allowOrigin)
			}
			if got := response.Header().Get("Access-Control-Allow-Credentials"); got != tc.credentials {
				t.Fatalf("allow credentials = %q, want %q", got, tc.credentials)
			}
		})
	}
}
