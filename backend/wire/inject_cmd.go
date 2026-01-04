package wire

import (
	"github.com/google/wire"
	"github.com/goforj/docs/internal/cmd"
)

// cmdSet is a wire set that provides the root command and its subcommands.
var cmdSet = wire.NewSet(
	cmd.AppCommandSet,
	cmd.NewRootCmd,
	cmd.NewAppCommands,
)
