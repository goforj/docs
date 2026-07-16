package docs

import (
	"fmt"
	"path"
	"regexp"
	"strings"
)

var markdownImageRegex = regexp.MustCompile(`!\[[^\]]*\]\(([^)]+)\)`)
var htmlImageRegex = regexp.MustCompile(`(?i)<img[^>]+src=["']([^"']+)["']`)
var htmlAnchorLinkRegex = regexp.MustCompile(`(?i)(<a\b[^>]*\bhref\s*=\s*["'])([^"']+)(["'])`)
var headingAnchorRegex = regexp.MustCompile(`^(#{2,6}) <a id="([^"]+)"></a>\s*(.+)$`)
var headingIDRegex = regexp.MustCompile(`\{#([^}]+)\}`)
var headingWithIDRegex = regexp.MustCompile(`^(#{2,6})\s+(.+?)\s+\{#([^}]+)\}\s*$`)

var markdownHeadingRegex = regexp.MustCompile(`^(#{1,6})\s+(.+?)\s*$`)

func transformReadme(readme string, repo RepoConfig, rawBase string) string {
	updated := rewriteImageLinks(readme, rawBase)
	updated = rewriteMarkdownLinks(updated, repo)
	updated = appendFrameworkGuide(updated, repo.FrameworkGuide)
	updated = rewriteHeadingAnchors(updated)
	return withFrontmatter(repo, updated)
}

// appendFrameworkGuide keeps framework-specific guidance out of standalone source READMEs while preserving navigation in the docs projection.
func appendFrameworkGuide(content string, guide FrameworkGuide) string {
	if guide.Title == "" || guide.Path == "" || guide.Summary == "" || strings.Contains("\n"+content, "\n## Using With GoForj") {
		return content
	}

	content = strings.TrimRight(content, "\n")
	return fmt.Sprintf(
		"%s\n\n## Using With GoForj\n\n%s\n\nFor generated App integration, see [%s](%s).\n",
		content,
		guide.Summary,
		guide.Title,
		guide.Path,
	)
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

func rewriteMarkdownLinks(content string, repo RepoConfig) string {
	base := webGithubBase(repo)
	branch := repo.Branch
	if branch == "" {
		branch = "main"
	}
	lines := strings.Split(content, "\n")
	inCode := false
	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "```") {
			inCode = !inCode
			continue
		}
		if inCode {
			continue
		}
		line = rewriteLineLinks(line, base, branch)
		lines[i] = rewriteHTMLLineLinks(line, base, branch)
	}
	return strings.Join(lines, "\n")
}

// rewriteHTMLLineLinks rewrites repository-relative anchor targets embedded in raw HTML.
func rewriteHTMLLineLinks(line string, base string, branch string) string {
	return htmlAnchorLinkRegex.ReplaceAllStringFunc(line, func(match string) string {
		parts := htmlAnchorLinkRegex.FindStringSubmatch(match)
		if len(parts) != 4 {
			return match
		}
		return parts[1] + rewriteLinkURL(parts[2], base, branch) + parts[3]
	})
}

func rewriteLineLinks(line string, base string, branch string) string {
	var out strings.Builder
	start := 0
	for {
		open := strings.Index(line[start:], "[")
		if open == -1 {
			out.WriteString(line[start:])
			break
		}
		open += start
		if open > 0 && line[open-1] == '!' {
			out.WriteString(line[start : open+1])
			start = open + 1
			continue
		}
		closeBracket := strings.Index(line[open:], "](")
		if closeBracket == -1 {
			out.WriteString(line[start:])
			break
		}
		closeBracket += open
		closeParen := strings.Index(line[closeBracket+2:], ")")
		if closeParen == -1 {
			out.WriteString(line[start:])
			break
		}
		closeParen += closeBracket + 2
		out.WriteString(line[start : closeBracket+2])
		url := line[closeBracket+2 : closeParen]
		out.WriteString(rewriteLinkURL(url, base, branch))
		out.WriteString(")")
		start = closeParen + 1
	}
	return out.String()
}

func rewriteLinkURL(url string, base string, branch string) string {
	trimmed := strings.TrimSpace(url)
	lower := strings.ToLower(trimmed)
	if strings.HasPrefix(lower, "http://") ||
		strings.HasPrefix(lower, "https://") ||
		strings.HasPrefix(lower, "mailto:") {
		return trimmed
	}
	if strings.HasPrefix(trimmed, "#") {
		return trimmed
	}

	pathPart := trimmed
	anchor := ""
	if hashIndex := strings.Index(trimmed, "#"); hashIndex != -1 {
		pathPart = trimmed[:hashIndex]
		anchor = trimmed[hashIndex:]
	}

	pathPart = strings.TrimPrefix(pathPart, "./")
	pathPart = strings.TrimPrefix(pathPart, "/")
	if pathPart == "" {
		return trimmed
	}

	mode := repositoryLinkMode(pathPart)
	return base + mode + "/" + branch + "/" + pathPart + anchor
}

// repositoryLinkMode recognizes conventional extensionless repository files because GitHub serves them through its blob route.
func repositoryLinkMode(pathPart string) string {
	if strings.HasSuffix(pathPart, "/") {
		return "tree"
	}

	leaf := path.Base(pathPart)
	if strings.Contains(leaf, ".") {
		return "blob"
	}

	switch strings.ToLower(leaf) {
	case "authors", "changelog", "code_of_conduct", "codeowners", "contributing", "dockerfile", "license", "licence", "makefile", "notice", "readme", "security":
		return "blob"
	default:
		return "tree"
	}
}

// rewriteHeadingAnchors gives source-owned IDs priority so API links keep targeting declaration examples when a section has the same name.
func rewriteHeadingAnchors(content string) string {
	lines := strings.Split(content, "\n")
	explicitAnchors := explicitHeadingAnchorCounts(lines)
	used := map[string]struct{}{}
	for i, line := range lines {
		if matches := headingAnchorRegex.FindStringSubmatch(line); len(matches) == 4 {
			level := matches[1]
			anchor := matches[2]
			title := strings.TrimSpace(matches[3])
			explicitAnchors[anchor]--
			unique := claimHeadingAnchor(anchor, used, explicitAnchors, true)
			lines[i] = fmt.Sprintf("%s %s {#%s}", level, title, unique)
			continue
		}
		if matches := headingWithIDRegex.FindStringSubmatch(line); len(matches) == 4 {
			level := matches[1]
			title := strings.TrimSpace(matches[2])
			anchor := matches[3]
			explicitAnchors[anchor]--
			unique := claimHeadingAnchor(anchor, used, explicitAnchors, true)
			lines[i] = fmt.Sprintf("%s %s {#%s}", level, title, unique)
			continue
		}
		if matches := markdownHeadingRegex.FindStringSubmatch(line); len(matches) == 3 {
			level := matches[1]
			title := strings.TrimSpace(matches[2])
			anchor := defaultAnchor(title)
			unique := claimHeadingAnchor(anchor, used, explicitAnchors, false)
			lines[i] = fmt.Sprintf("%s %s {#%s}", level, title, unique)
		}
	}
	return strings.Join(lines, "\n")
}

// explicitHeadingAnchorCounts reserves source-owned IDs before implicit Markdown headings are assigned their anchors.
func explicitHeadingAnchorCounts(lines []string) map[string]int {
	counts := map[string]int{}
	for _, line := range lines {
		if matches := headingAnchorRegex.FindStringSubmatch(line); len(matches) == 4 {
			counts[matches[2]]++
			continue
		}
		if matches := headingWithIDRegex.FindStringSubmatch(line); len(matches) == 4 {
			counts[matches[3]]++
		}
	}
	return counts
}

// claimHeadingAnchor keeps the preferred explicit ID when possible and otherwise selects the first unclaimed, unreserved suffix.
func claimHeadingAnchor(anchor string, used map[string]struct{}, reserved map[string]int, explicit bool) string {
	if anchor == "" {
		return anchor
	}
	if _, exists := used[anchor]; !exists && (explicit || reserved[anchor] == 0) {
		used[anchor] = struct{}{}
		return anchor
	}

	for suffix := 2; ; suffix++ {
		candidate := fmt.Sprintf("%s-%d", anchor, suffix)
		_, exists := used[candidate]
		if !exists && reserved[candidate] == 0 {
			used[candidate] = struct{}{}
			return candidate
		}
	}
}

// defaultAnchor mirrors the simple heading normalization used by the imported README pages.
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

// withFrontmatter records source-repository metadata and optional presentation policy for the generated page.
func withFrontmatter(repo RepoConfig, content string) string {
	title := repo.Title
	if title == "" {
		title = repo.Slug
	}
	repoURL := strings.TrimSuffix(repo.CloneURL, ".git")
	autoTitle := ""
	if repo.NoAutoTitle {
		autoTitle = "noAutoTitle: true\n"
	}
	frontmatter := fmt.Sprintf(
		"---\ntitle: %s\nrepoSlug: %s\nrepoUrl: %s\n%s---\n\n",
		title,
		repo.Slug,
		repoURL,
		autoTitle,
	)
	return frontmatter + content
}
