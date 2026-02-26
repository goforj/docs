package docs

import (
	"fmt"
	"path"
	"regexp"
	"strings"
)

var markdownImageRegex = regexp.MustCompile(`!\[[^\]]*\]\(([^)]+)\)`)
var htmlImageRegex = regexp.MustCompile(`(?i)<img[^>]+src=["']([^"']+)["']`)
var headingAnchorRegex = regexp.MustCompile(`^(#{2,6}) <a id="([^"]+)"></a>\s*(.+)$`)
var headingIDRegex = regexp.MustCompile(`\{#([^}]+)\}`)
var headingWithIDRegex = regexp.MustCompile(`^(#{2,6})\s+(.+?)\s+\{#([^}]+)\}\s*$`)

var markdownHeadingRegex = regexp.MustCompile(`^(#{1,6})\s+(.+?)\s*$`)

func transformReadme(readme string, repo RepoConfig, rawBase string) string {
	updated := rewriteImageLinks(readme, rawBase)
	updated = rewriteMarkdownLinks(updated, repo)
	updated = rewriteHeadingAnchors(updated, repo.Title)
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
		lines[i] = rewriteLineLinks(line, base, branch)
	}
	return strings.Join(lines, "\n")
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

	leaf := path.Base(pathPart)
	isFile := strings.Contains(leaf, ".") && !strings.HasSuffix(pathPart, "/")
	mode := "tree"
	if isFile {
		mode = "blob"
	}

	return base + mode + "/" + branch + "/" + pathPart + anchor
}

func rewriteHeadingAnchors(content string, pageTitle string) string {
	lines := strings.Split(content, "\n")
	used := map[string]int{}
	if anchor := defaultAnchor(pageTitle); anchor != "" {
		// VitePress generates an implicit anchor for the page title/frontmatter H1.
		used[anchor] = 1
	}
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

func withFrontmatter(repo RepoConfig, content string) string {
	title := repo.Title
	if title == "" {
		title = repo.Slug
	}
	repoURL := strings.TrimSuffix(repo.CloneURL, ".git")
	frontmatter := fmt.Sprintf(
		"---\ntitle: %s\nrepoSlug: %s\nrepoUrl: %s\n---\n\n",
		title,
		repo.Slug,
		repoURL,
	)
	return frontmatter + content
}
