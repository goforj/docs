package wire

import (
	"context"
	"github.com/goforj/docs/internal/cmd"
	"github.com/goforj/docs/internal/logger"
	gocache "github.com/patrickmn/go-cache"
)

// App is the root App resource
type App struct {
	context context.Context
	rootCmd *cmd.RootCmd
	logger  *logger.AppLogger
	cache   *gocache.Cache
}

// RootCmd returns the root command of the application
func (a *App) RootCmd() *cmd.RootCmd {
	return a.rootCmd
}

// Logger returns the logger of the application
func (a *App) Logger() *logger.AppLogger {
	return a.logger
}

// NewApplication creates a new App instance
func NewApplication(
	logger *logger.AppLogger,
	rootCmd *cmd.RootCmd,
	cache *gocache.Cache,
) App {
	return App{
		context: context.Background(),
		rootCmd: rootCmd,
		logger:  logger,
		cache: cache,
	}
}
