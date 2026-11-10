package http

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
)

// responseBodyWriter is a custom http.ResponseWriter that captures the response body.
type responseBodyWriter struct {
	http.ResponseWriter
	status int
	body   *strings.Builder
}

// WriteHeader creates a new response body writer.
func (w *responseBodyWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

// Write captures the response body for non-200 statuses.
func (w *responseBodyWriter) Write(b []byte) (int, error) {
	if w.status != http.StatusOK {
		w.body.Write(b)
	}
	return w.ResponseWriter.Write(b)
}

// Unwrap preserves access to Echo's response metadata and optional writer capabilities.
func (w *responseBodyWriter) Unwrap() http.ResponseWriter {
	return w.ResponseWriter
}

// logNon200ResponseBodyMiddleware captures response body for non-200 statuses.
func (s *Server) logNon200ResponseBodyMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			// Preserve the response wrapper chain used by Echo middleware.
			originalWriter := c.Response()
			writer := &responseBodyWriter{
				ResponseWriter: originalWriter,
				body:           new(strings.Builder),
				status:         http.StatusOK,
			}
			c.SetResponse(writer)
			defer c.SetResponse(originalWriter)

			err := next(c)

			if writer.status != http.StatusOK && writer.body.Len() > 0 {
				s.logger.Info().
					Any("status", writer.status).
					Str("body", writer.body.String()).
					Msg("Non-200 HTTP Response")
			}

			return err
		}
	}
}
