package docs

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func cloneRepo(url string, dest string, branch string) (string, error) {
	if isGitRepo(dest) {
		if err := updateRepo(dest, branch); err != nil {
			return "", fmt.Errorf("update repo: %w", err)
		}
		return "updated", nil
	}

	if err := os.RemoveAll(dest); err != nil {
		return "", fmt.Errorf("clean repo dir: %w", err)
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
		return "", fmt.Errorf("%w: %s", err, stderr.String())
	}
	return "cloned", nil
}

func isGitRepo(path string) bool {
	stat, err := os.Stat(filepath.Join(path, ".git"))
	return err == nil && stat.IsDir()
}

func updateRepo(dest string, branch string) error {
	var stderr bytes.Buffer
	if branch != "" {
		fetch := exec.Command("git", "-C", dest, "fetch", "--prune", "--depth", "1", "origin", branch)
		fetch.Stderr = &stderr
		if err := fetch.Run(); err != nil {
			return fmt.Errorf("%w: %s", err, stderr.String())
		}
		checkout := exec.Command("git", "-C", dest, "checkout", branch)
		checkout.Stderr = &stderr
		if err := checkout.Run(); err != nil {
			return fmt.Errorf("%w: %s", err, stderr.String())
		}
		reset := exec.Command("git", "-C", dest, "reset", "--hard", "origin/"+branch)
		reset.Stderr = &stderr
		if err := reset.Run(); err != nil {
			return fmt.Errorf("%w: %s", err, stderr.String())
		}
		return nil
	}

	pull := exec.Command("git", "-C", dest, "pull", "--ff-only")
	pull.Stderr = &stderr
	if err := pull.Run(); err != nil {
		return fmt.Errorf("%w: %s", err, stderr.String())
	}
	return nil
}
