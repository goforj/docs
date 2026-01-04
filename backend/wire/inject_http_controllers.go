package wire

import (
	"github.com/goforj/docs/internal/examples"
	"github.com/goforj/docs/internal/hello"
	"github.com/google/wire"
)

// httpControllerSet provides all HTTP route controllers.
var httpAppControllerSet = wire.NewSet(
	examples.NewController,
	hello.NewController,
)
