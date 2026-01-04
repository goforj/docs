package docs

import (
	"fmt"
	"regexp"
	"strings"
)

var markdownImageRegex = regexp.MustCompile(`!\[[^\]]*\]\(([^)]+)\)`)
var htmlImageRegex = regexp.MustCompile(`(?i)<img[^>]+src=["']([^"']+)["']`)
var examplePathRegex = regexp.MustCompile(`examples/([a-zA-Z0-9_-]+)/main\.go`)
var anchorRegex = regexp.MustCompile(`<a id="([^"]+)"></a>`)
var headingAnchorRegex = regexp.MustCompile(`^(#{2,6}) <a id="([^"]+)"></a>\s*(.+)$`)
var headingIDRegex = regexp.MustCompile(`\{#([^}]+)\}`)
var headingWithIDRegex = regexp.MustCompile(`^(#{2,6})\s+(.+?)\s+\{#([^}]+)\}\s*$`)

var markdownHeadingRegex = regexp.MustCompile(`^(#{1,6})\s+(.+?)\s*$`)

func transformReadme(readme string, repo RepoConfig, rawBase string, examples []ExampleProgram) string {
	updated := rewriteImageLinks(readme, rawBase)
	updated = wrapExamples(updated, repo.Slug, examples)
	updated = rewriteHeadingAnchors(updated)
	return withFrontmatter(repo, updated)
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

func rewriteHeadingAnchors(content string) string {
	lines := strings.Split(content, "\n")
	used := map[string]int{}
	for i, line := range lines {
		if matches := headingAnchorRegex.FindStringSubmatch(line); len(matches) == 4 {
			level := matches[1]
			anchor := matches[2]
			title := strings.TrimSpace(matches[3])
			unique := uniqueAnchor(anchor, used)
			lines[i] = fmt.Sprintf("%s %s {#%s}", level, title, unique)
			continue
		}
		if matches := headingWithIDRegex.FindStringSubmatch(line); len(matches) == 4 {
			level := matches[1]
			title := strings.TrimSpace(matches[2])
			anchor := matches[3]
			unique := uniqueAnchor(anchor, used)
			lines[i] = fmt.Sprintf("%s %s {#%s}", level, title, unique)
			continue
		}
		if matches := markdownHeadingRegex.FindStringSubmatch(line); len(matches) == 3 {
			level := matches[1]
			title := strings.TrimSpace(matches[2])
			anchor := defaultAnchor(title)
			unique := uniqueAnchor(anchor, used)
			lines[i] = fmt.Sprintf("%s %s {#%s}", level, title, unique)
		}
	}
	return strings.Join(lines, "\n")
}

func uniqueAnchor(anchor string, used map[string]int) string {
	if anchor == "" {
		return anchor
	}
	count := used[anchor]
	if count == 0 {
		used[anchor] = 1
		return anchor
	}
	count++
	used[anchor] = count
	return fmt.Sprintf("%s-%d", anchor, count)
}

func defaultAnchor(title string) string {
	lower := strings.ToLower(strings.TrimSpace(title))
	lower = strings.ReplaceAll(lower, "·", "")
	lower = strings.ReplaceAll(lower, "—", "")
	lower = strings.ReplaceAll(lower, "–", "")
	lower = strings.ReplaceAll(lower, " ", "-")
	lower = strings.ReplaceAll(lower, "\t", "-")
	lower = strings.ReplaceAll(lower, "--", "-")
	return strings.Trim(lower, "-")
}

func wrapExamples(content string, repoSlug string, examples []ExampleProgram) string {
	lines := strings.Split(content, "\n")
	var out strings.Builder

	inCode := false
	var fenceLine string
	var lang string
	var codeLines []string
	currentAnchor := ""
	currentHint := ""
	inApiEmbed := false
	usedExample := map[string]bool{}
	exampleMap := map[string]ExampleProgram{}
	for _, example := range examples {
		exampleMap[example.ID] = example
	}

	for i, line := range lines {
		if !inCode {
			if strings.Contains(line, "<!-- api:embed:start -->") {
				inApiEmbed = true
			}
			if strings.Contains(line, "<!-- api:embed:end -->") {
				inApiEmbed = false
			}
			if matches := anchorRegex.FindStringSubmatch(line); len(matches) == 2 {
				currentAnchor = matches[1]
			} else if matches := headingIDRegex.FindStringSubmatch(line); len(matches) == 2 {
				currentAnchor = matches[1]
			}
			if matches := examplePathRegex.FindStringSubmatch(line); len(matches) == 2 {
				currentHint = matches[1]
			}
			if inApiEmbed && strings.HasPrefix(strings.TrimSpace(line), "_Example:") {
				continue
			}
		}

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
				if inApiEmbed {
					exampleID := currentAnchor
					if exampleID != "" && !usedExample[exampleID] && exampleMap[exampleID].Code != "" {
						example := exampleMap[exampleID]
						out.WriteString(fmt.Sprintf("<GoForjExample repo=\"%s\" example=\"%s\">\n\n", repoSlug, exampleID))
						out.WriteString("```go\n")
						out.WriteString(extractExampleBody(example.Code))
						if example.Code != "" {
							out.WriteString("\n")
						}
						out.WriteString("```\n\n")
						out.WriteString("</GoForjExample>")
						usedExample[exampleID] = true
						wrapped = true
					} else if exampleID != "" && usedExample[exampleID] {
						wrapped = true
					}
				} else if exampleID, ok := resolveExampleID(currentHint, currentAnchor, code, examples, usedExample); ok {
					example := exampleMap[exampleID]
					out.WriteString(fmt.Sprintf("<GoForjExample repo=\"%s\" example=\"%s\">\n\n", repoSlug, exampleID))
					out.WriteString("```go\n")
					out.WriteString(extractExampleBody(example.Code))
					if example.Code != "" {
						out.WriteString("\n")
					}
					out.WriteString("```\n\n")
					out.WriteString("</GoForjExample>")
					usedExample[exampleID] = true
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

func resolveExampleID(hint string, anchor string, code string, examples []ExampleProgram, used map[string]bool) (string, bool) {
	if hint != "" && hasExample(hint, examples) {
		return hint, true
	}
	if anchor != "" && hasExample(anchor, examples) {
		return anchor, true
	}
	if exampleID, ok := matchExample(code, examples, used); ok {
		return exampleID, true
	}
	return "", false
}

func matchExample(code string, examples []ExampleProgram, used map[string]bool) (string, bool) {
	needle := normalizeCode(code)
	if needle == "" {
		return "", false
	}
	for _, example := range examples {
		if used[example.ID] {
			continue
		}
		if example.Normalized != "" && strings.Contains(example.Normalized, needle) {
			used[example.ID] = true
			return example.ID, true
		}
	}
	return "", false
}

func hasExample(id string, examples []ExampleProgram) bool {
	for _, example := range examples {
		if example.ID == id {
			return true
		}
	}
	return false
}

func withFrontmatter(repo RepoConfig, content string) string {
	title := repo.Title
	if title == "" {
		title = repo.Slug
	}
	frontmatter := fmt.Sprintf("---\ntitle: %s\n---\n\n", title)
	return frontmatter + content
}

func extractExampleBody(code string) string {
	lines := strings.Split(code, "\n")
	inBody := false
	braces := 0
	var out []string

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "//go:build") || strings.HasPrefix(trimmed, "// +build") {
			continue
		}
		if strings.HasPrefix(trimmed, "package ") || strings.HasPrefix(trimmed, "import ") {
			continue
		}
		if strings.HasPrefix(trimmed, "func main()") {
			inBody = true
			if strings.Contains(trimmed, "{") {
				braces++
			}
			continue
		}
		if !inBody {
			continue
		}
		braces += strings.Count(line, "{")
		braces -= strings.Count(line, "}")
		if braces <= 0 {
			break
		}
		out = append(out, line)
	}

	// Trim leading/trailing empty lines while preserving indentation.
	start := 0
	end := len(out)
	for start < end && strings.TrimSpace(out[start]) == "" {
		start++
	}
	for end > start && strings.TrimSpace(out[end-1]) == "" {
		end--
	}
	if start >= end {
		return ""
	}
	trimmed := out[start:end]
	trimmed = dropLeadingDocBlock(trimmed)
	trimIndent := minIndent(trimmed)
	if trimIndent > 0 {
		for i, line := range trimmed {
			trimmed[i] = stripIndent(line, trimIndent)
		}
	}
	return strings.Join(trimmed, "\n")
}

func dropLeadingDocBlock(lines []string) []string {
	start := 0
	for start < len(lines) {
		trimmed := strings.TrimSpace(lines[start])
		if trimmed == "" {
			start++
			continue
		}
		if strings.HasPrefix(trimmed, "// Example:") {
			break
		}
		if strings.HasPrefix(trimmed, "//") {
			start++
			continue
		}
		break
	}
	return lines[start:]
}

func minIndent(lines []string) int {
	min := -1
	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		count := 0
		for _, r := range line {
			if r == ' ' {
				count++
				continue
			}
			if r == '\t' {
				count++
				continue
			}
			break
		}
		if min == -1 || count < min {
			min = count
		}
	}
	if min < 0 {
		return 0
	}
	return min
}

func stripIndent(line string, count int) string {
	if count <= 0 {
		return line
	}
	remaining := count
	for i, r := range line {
		if r == ' ' || r == '\t' {
			remaining--
			if remaining == 0 {
				return line[i+1:]
			}
			continue
		}
		return line[i:]
	}
	return ""
}
