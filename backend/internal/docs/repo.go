package docs

import "strings"

// RepoConfig describes a repo to pull docs from.
type RepoConfig struct {
	Slug       string
	CloneURL   string
	Branch     string
	OutputPath string
}

func rawGithubBase(repo RepoConfig, branch string) string {
	base := "https://raw.githubusercontent.com/goforj/" + repo.Slug + "/" + branch + "/"
	return ensureTrailingSlash(base)
}

func ensureTrailingSlash(value string) string {
	if strings.HasSuffix(value, "/") {
		return value
	}
	return value + "/"
}
