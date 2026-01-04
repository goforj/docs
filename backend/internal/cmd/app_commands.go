package cmd

import "github.com/goforj/docs/internal/docs"

// AppCommands contains application-specific commands
type AppCommands struct {
	HelloWorldCmd       HelloWorldCmd            `cmd:"" name:"hello:world" help:"Hello world command" hidden:""`
	DocsGenerateCommand docs.DocsGenerateCommand `cmd:"" name:"docs:generate" help:"Generate documentation pages from repo READMEs"`
}

// NewAppCommands creates a new AppCommands instance with the given commands.
func NewAppCommands(
	helloWorldCmd *HelloWorldCmd, // Injected command
	docsGenerateCommand *docs.DocsGenerateCommand,
) *AppCommands {
	return &AppCommands{
		HelloWorldCmd:       *helloWorldCmd, // Assign the injected command
		DocsGenerateCommand: *docsGenerateCommand,
	}
}
