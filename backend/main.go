package main

import (
	"embed"
	"fmt"
	"github.com/alecthomas/kong"
	"github.com/goforj/docs/internal/cmd"
	"github.com/goforj/env"
	"github.com/goforj/docs/internal/http"
	"github.com/goforj/docs/wire"
	"os"
	"strings"
)

//go:embed all:frontend/dist/*
var spa embed.FS

func main() {
	// default
	_ = os.Setenv("APP_ENV", "local")

	// load env
	if err := env.LoadEnvFileIfExists(); err != nil {
		fmt.Println("Error loading env file:", err)
		return
	}

	// initialize embedded spa's
	http.RegisterSpa("/*", "frontend/dist", &spa)

	// initialize application
	app, err := wire.InitializeApplication()
	if err != nil {
		fmt.Println("Error initializing application:", err)
		return
	}
	app.Logger().Debug().Msg("App initialized")

	// Setup Kong parser
	parser, err := kong.New(
		app.RootCmd(),
		kong.Name(strings.ToLower(os.Getenv("APP_NAME"))),
		kong.Help(cmd.KongHelpFormatter),
	)
	if err != nil {
		app.Logger().Fatal().Err(err).Msg("Error setting up CLI parser")
		return
	}

	args := os.Args[1:]
	if len(args) == 0 {
		ctx, _ := parser.Parse([]string{"--help"})
		ctx.PrintUsage(false)
		return
	}

	// Parse CLI args
	ctx, err := parser.Parse(args)
	if err != nil {
		parser.FatalIfErrorf(err)
		return
	}

	// Execute command
	err = ctx.Run()
	if err != nil {
		app.Logger().Fatal().Err(err).Msg("Error executing command")
	}
}
