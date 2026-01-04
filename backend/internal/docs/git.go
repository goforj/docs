package docs

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
)

func cloneRepo(url string, dest string, branch string) error {
	if err := os.RemoveAll(dest); err != nil {
		return fmt.Errorf("clean repo dir: %w", err)
	}

	var stderr bytes.Buffer
	args := []string{"clone", "--depth", "1"}
	if branch != "" {
		args = append(args, "--branch", branch)
	}
	args = append(args, url, dest)
	cmd := exec.Command("git", args...)
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("%w: %s", err, stderr.String())
	}
	return nil
}
