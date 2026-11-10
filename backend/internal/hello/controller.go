package hello

import (
	"github.com/goforj/docs/internal/http"
	"github.com/goforj/docs/internal/logger"
	"github.com/labstack/echo/v5"
)

// Controller handles the sample hello route.
type Controller struct {
	logger *logger.AppLogger
}

// NewController creates a new hello controller.
func NewController(logger *logger.AppLogger) *Controller {
	return &Controller{
		logger: logger,
	}
}

// Routes returns the routes for the controller.
func (c *Controller) Routes() []http.Route {
	return []http.Route{
		http.NewRoute(http.MethodGet, "/hello", c.Hello),
	}
}

// Hello serves the sample greeting.
func (c *Controller) Hello(e *echo.Context) error {
	c.logger.Info().Msg("Hello from hello controller")
	return e.String(http.StatusOK, "Hello, World!")
}
