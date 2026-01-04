//go:build wireinject
// +build wireinject

package wire

import (
	"github.com/google/wire"
	"github.com/goforj/docs/internal/logger"
)

// InitializeApplication initializes the application by providing all the dependencies.
func InitializeApplication() (App, error) {
	wire.Build(
		appSet,
		cmdSet,
		httpServerSet,
		httpAppControllerSet,
		logger.ProvideAppLogger,
		NewApplication,
	)

	return App{}, nil
}
