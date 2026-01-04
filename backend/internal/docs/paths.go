package docs

import (
	"fmt"
	"os"
	"path/filepath"
)

func findDocsRoot() (string, error) {
	candidates := []string{
		"docs",
		filepath.Join("..", "docs"),
	}

	for _, candidate := range candidates {
		info, err := os.Stat(candidate)
		if err == nil && info.IsDir() {
			return candidate, nil
		}
	}

	return "", fmt.Errorf("docs directory not found from current working directory")
}
