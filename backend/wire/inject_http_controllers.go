package wire

import (
	"github.com/goforj/docs/internal/hello"
	"github.com/google/wire"
)

// httpControllerSet provides all HTTP route controllers.
var httpAppControllerSet = wire.NewSet(
	hello.NewController,
)
