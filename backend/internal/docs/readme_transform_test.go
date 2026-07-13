package docs

import (
	"strings"
	"testing"
)

// TestRewriteMarkdownLinksRewritesRawHTMLAnchors verifies generated pages keep repository links outside the docs site.
func TestRewriteMarkdownLinksRewritesRawHTMLAnchors(t *testing.T) {
	repo := RepoConfig{
		Slug:     "godump",
		CloneURL: "https://github.com/goforj/godump.git",
		Branch:   "main",
	}
	input := strings.Join([]string{
		`<a href="LICENSE">License</a>`,
		`<p><a class="example" href='./examples/basic/main.go'>Example</a></p>`,
		`<a href="docs/">Docs</a>`,
		`<a href="https://example.com">External</a>`,
		`<a href="#usage">Usage</a>`,
		`<a href="mailto:docs@example.com">Email</a>`,
	}, "\n")

	got := rewriteMarkdownLinks(input, repo)
	wants := []string{
		`href="https://github.com/goforj/godump/blob/main/LICENSE"`,
		`href='https://github.com/goforj/godump/blob/main/examples/basic/main.go'`,
		`href="https://github.com/goforj/godump/tree/main/docs/"`,
		`href="https://example.com"`,
		`href="#usage"`,
		`href="mailto:docs@example.com"`,
	}
	for _, want := range wants {
		if !strings.Contains(got, want) {
			t.Fatalf("rewriteMarkdownLinks() missing %q in:\n%s", want, got)
		}
	}
}

// TestRewriteMarkdownLinksPreservesLinksInsideCodeFences verifies documentation examples are not rewritten as page links.
func TestRewriteMarkdownLinksPreservesLinksInsideCodeFences(t *testing.T) {
	repo := RepoConfig{
		Slug:     "godump",
		CloneURL: "https://github.com/goforj/godump.git",
		Branch:   "main",
	}
	input := strings.Join([]string{
		"```html",
		`<a href="LICENSE">License</a>`,
		`[Example](./examples/basic/main.go)`,
		"```",
	}, "\n")

	if got := rewriteMarkdownLinks(input, repo); got != input {
		t.Fatalf("rewriteMarkdownLinks() changed fenced content:\n%s", got)
	}
}

// TestTransformReadmeAppendsFrameworkGuide verifies generated library pages link back to their canonical App workflow.
func TestTransformReadmeAppendsFrameworkGuide(t *testing.T) {
	repo := RepoConfig{
		Slug:       "queue",
		Title:      "Queue",
		CloneURL:   "https://github.com/goforj/queue.git",
		Branch:     "main",
		OutputPath: "libraries/queue.md",
		FrameworkGuide: FrameworkGuide{
			Title:   "Queues",
			Path:    "/async/queues",
			Summary: "Generated Apps expose named queues through generated accessors.",
		},
	}

	got := transformReadme("# Queue\n\nStandalone package documentation.\n", repo, "https://raw.githubusercontent.com/goforj/queue/main/")
	wants := []string{
		"## Using With GoForj {#using-with-goforj}",
		"Generated Apps expose named queues through generated accessors.",
		"For generated App integration, see [Queues](/async/queues).",
	}
	for _, want := range wants {
		if !strings.Contains(got, want) {
			t.Fatalf("transformReadme() missing %q in:\n%s", want, got)
		}
	}
}

// TestAppendFrameworkGuideRequiresCompleteConfiguration verifies partial mappings do not produce incomplete links.
func TestAppendFrameworkGuideRequiresCompleteConfiguration(t *testing.T) {
	input := "# Queue\n"
	for _, guide := range []FrameworkGuide{
		{},
		{Title: "Queues", Path: "/async/queues"},
		{Title: "Queues", Summary: "Queue integration."},
		{Path: "/async/queues", Summary: "Queue integration."},
	} {
		if got := appendFrameworkGuide(input, guide); got != input {
			t.Fatalf("appendFrameworkGuide() changed content for incomplete guide %#v:\n%s", guide, got)
		}
	}
}

// TestAppendFrameworkGuidePreservesExistingSection verifies source-owned integration guidance is not duplicated.
func TestAppendFrameworkGuidePreservesExistingSection(t *testing.T) {
	input := "# Queue\n\n## Using With GoForj\n\nExisting guidance.\n"
	guide := FrameworkGuide{Title: "Queues", Path: "/async/queues", Summary: "Queue integration."}

	if got := appendFrameworkGuide(input, guide); got != input {
		t.Fatalf("appendFrameworkGuide() changed existing guidance:\n%s", got)
	}
}
