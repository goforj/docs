package wire

import (
	"github.com/google/wire"
	"github.com/goforj/docs/internal/hello"
)

// httpControllerSet provides all HTTP route controllers.
var httpAppControllerSet = wire.NewSet(
	hello.NewController,
)
