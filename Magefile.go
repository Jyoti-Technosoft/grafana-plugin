//go:build mage
// +build mage

package main

import (
	"os"
	"os/exec"
)

// Build compiles the backend binary
func Build() error {
	cmd := exec.Command("go", "build", "-o", "dist/plugin_linux_amd64", "./pkg")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}