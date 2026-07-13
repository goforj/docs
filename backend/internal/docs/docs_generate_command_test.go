package docs

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestResolveLocalSource verifies that local generation is explicit and limited to existing directories.
func TestResolveLocalSource(t *testing.T) {
	t.Parallel()

	if got, err := resolveLocalSource("", ""); err != nil || got != "" {
		t.Fatalf("resolveLocalSource() = %q, %v; want empty source", got, err)
	}
	if _, err := resolveLocalSource("", t.TempDir()); err == nil || !strings.Contains(err.Error(), "requires --repo") {
		t.Fatalf("resolveLocalSource() error = %v, want --repo requirement", err)
	}

	directory := t.TempDir()
	got, err := resolveLocalSource("str", directory)
	if err != nil {
		t.Fatalf("resolveLocalSource() error = %v", err)
	}
	want, err := filepath.Abs(directory)
	if err != nil {
		t.Fatalf("filepath.Abs() error = %v", err)
	}
	if got != want {
		t.Fatalf("resolveLocalSource() = %q, want %q", got, want)
	}

	file := filepath.Join(t.TempDir(), "README.md")
	if err := os.WriteFile(file, []byte("test"), 0o644); err != nil {
		t.Fatalf("write test file: %v", err)
	}
	if _, err := resolveLocalSource("str", file); err == nil || !strings.Contains(err.Error(), "not a directory") {
		t.Fatalf("resolveLocalSource() error = %v, want directory error", err)
	}
	if _, err := resolveLocalSource("str", filepath.Join(t.TempDir(), "missing")); err == nil {
		t.Fatal("resolveLocalSource() error = nil, want missing path error")
	}
}
