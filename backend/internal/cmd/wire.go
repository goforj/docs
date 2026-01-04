package cmd

import (
	"github.com/goforj/docs/internal/docs"
	"github.com/google/wire"
)

// AppCommandSet is a wire set that provides the application commands.
var AppCommandSet = wire.NewSet(
	NewHelloWorldCmd,
	docs.NewDocsGenerateCommand,
)
