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
