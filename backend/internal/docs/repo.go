package docs

import "strings"

// RepoConfig describes a repo to pull docs from.
type RepoConfig struct {
	Slug       string
	Title      string
	CloneURL   string
	Branch     string
	OutputPath string
	ReadmePath string
	RepoName   string
}

func webGithubBase(repo RepoConfig) string {
	if repo.RepoName != "" {
		return ensureTrailingSlash("https://github.com/goforj/" + repo.RepoName)
	}
	base := strings.TrimSuffix(repo.CloneURL, ".git")
	return ensureTrailingSlash(base)
}

func rawGithubBase(repo RepoConfig, branch string) string {
	repoName := repo.Slug
	if repo.RepoName != "" {
		repoName = repo.RepoName
	}
	base := "https://raw.githubusercontent.com/goforj/" + repoName + "/" + branch + "/"
	return ensureTrailingSlash(base)
}

func ensureTrailingSlash(value string) string {
	if strings.HasSuffix(value, "/") {
		return value
	}
	return value + "/"
}
