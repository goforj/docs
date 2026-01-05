package wire

import (
	"time"

	"github.com/goforj/docs/internal/analytics"
	"github.com/google/wire"
	gocache "github.com/patrickmn/go-cache"
)

// appSet is a wire set that provides any application-level services and dependencies.
// for more specific sets, you can create your own
var appSet = wire.NewSet(
	analytics.NewTracker,
	provideLocalCache,
)

// provides local lru cache
func provideLocalCache() *gocache.Cache {
	return gocache.New(5*time.Minute, 10*time.Minute)
}
