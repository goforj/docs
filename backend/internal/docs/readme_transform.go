package docs

import (
	"fmt"
	"regexp"
	"strings"
)

var markdownImageRegex = regexp.MustCompile(`!\[[^\]]*\]\(([^)]+)\)`)
var htmlImageRegex = regexp.MustCompile(`(?i)<img[^>]+src=["']([^"']+)["']`)

func transformReadme(readme string, repoSlug string, rawBase string, examples []ExampleProgram) string {
	updated := rewriteImageLinks(readme, rawBase)
	updated = wrapExamples(updated, repoSlug, examples)
	return withFrontmatter(repoSlug, updated)
}

func rewriteImageLinks(content string, rawBase string) string {
	withMarkdownImages := markdownImageRegex.ReplaceAllStringFunc(content, func(match string) string {
		parts := markdownImageRegex.FindStringSubmatch(match)
		if len(parts) < 2 {
			return match
		}
		return strings.Replace(match, parts[1], rewriteImageURL(parts[1], rawBase), 1)
	})

	withHTMLImages := htmlImageRegex.ReplaceAllStringFunc(withMarkdownImages, func(match string) string {
		parts := htmlImageRegex.FindStringSubmatch(match)
		if len(parts) < 2 {
			return match
		}
		return strings.Replace(match, parts[1], rewriteImageURL(parts[1], rawBase), 1)
	})

	return withHTMLImages
}

func rewriteImageURL(url string, rawBase string) string {
	trimmed := strings.TrimSpace(url)
	lower := strings.ToLower(trimmed)
	if strings.HasPrefix(lower, "http://") || strings.HasPrefix(lower, "https://") || strings.HasPrefix(lower, "data:") {
		return trimmed
	}
	if strings.HasPrefix(trimmed, "#") {
		return trimmed
	}

	trimmed = strings.TrimPrefix(trimmed, "./")
	trimmed = strings.TrimPrefix(trimmed, "/")
	return rawBase + trimmed
}

func wrapExamples(content string, repoSlug string, examples []ExampleProgram) string {
	lines := strings.Split(content, "\n")
	var out strings.Builder

	inCode := false
	var fenceLine string
	var lang string
	var codeLines []string

	for i, line := range lines {
		if strings.HasPrefix(line, "```") {
			if !inCode {
				inCode = true
				fenceLine = line
				lang = strings.TrimSpace(strings.TrimPrefix(line, "```"))
				codeLines = codeLines[:0]
				continue
			}

			code := strings.Join(codeLines, "\n")
			wrapped := false
			if strings.HasPrefix(strings.ToLower(lang), "go") {
				if exampleID, ok := matchExample(code, examples); ok {
					out.WriteString(fmt.Sprintf("<GoForjExample repo=\"%s\" example=\"%s\">\n\n", repoSlug, exampleID))
					out.WriteString(fenceLine + "\n")
					out.WriteString(code)
					if code != "" {
						out.WriteString("\n")
					}
					out.WriteString("```\n\n")
					out.WriteString("</GoForjExample>")
					wrapped = true
				}
			}

			if !wrapped {
				out.WriteString(fenceLine + "\n")
				out.WriteString(code)
				if code != "" {
					out.WriteString("\n")
				}
				out.WriteString("```")
			}

			if i < len(lines)-1 {
				out.WriteString("\n")
			}

			inCode = false
			continue
		}

		if inCode {
			codeLines = append(codeLines, line)
			continue
		}

		out.WriteString(line)
		if i < len(lines)-1 {
			out.WriteString("\n")
		}
	}

	return out.String()
}

func matchExample(code string, examples []ExampleProgram) (string, bool) {
	needle := normalizeCode(code)
	if needle == "" {
		return "", false
	}
	for _, example := range examples {
		if strings.Contains(example.Code, needle) {
			return example.ID, true
		}
	}
	return "", false
}

func withFrontmatter(repoSlug string, content string) string {
	frontmatter := fmt.Sprintf("---\ntitle: %s\n---\n\n", repoSlug)
	return frontmatter + content
}
