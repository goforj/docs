package wire

import (
	"github.com/google/wire"
	"github.com/goforj/docs/internal/http"
	"github.com/goforj/docs/internal/router"
)

// httpServerSet is a wire set that provides the HTTP server and its routes.
var httpServerSet = wire.NewSet(
	http.NewServer,
	http.NewServeCmd,
	http.NewRouteListCmd,
	router.ProvideRoutes,
	router.ProvideAppRoutes,
)
