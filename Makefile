NPM ?= npm

.PHONY: help install ci dev electron run start build package package-dir package-mac package-win package-current package-all preview typecheck lint test coverage audit check verify clean

help:
	@printf '%s\n' 'Available targets:'
	@printf '  %-18s %s\n' 'make install' 'Install dependencies with npm install'
	@printf '  %-18s %s\n' 'make ci' 'Install dependencies from package-lock.json'
	@printf '  %-18s %s\n' 'make dev' 'Run the Vite renderer only'
	@printf '  %-18s %s\n' 'make electron' 'Run the full local Electron desktop app'
	@printf '  %-18s %s\n' 'make run' 'Run the full local Electron desktop app'
	@printf '  %-18s %s\n' 'make start' 'Alias for make run'
	@printf '  %-18s %s\n' 'make build' 'Build Electron main/preload and renderer assets'
	@printf '  %-18s %s\n' 'make package' 'Build installer artifacts for the current platform'
	@printf '  %-18s %s\n' 'make package-dir' 'Build an unpacked desktop app for the current platform'
	@printf '  %-18s %s\n' 'make package-mac' 'Build unsigned macOS DMG and ZIP artifacts'
	@printf '  %-18s %s\n' 'make package-win' 'Build unsigned Windows NSIS and ZIP artifacts'
	@printf '  %-18s %s\n' 'make package-all' 'Build macOS and Windows artifacts'
	@printf '  %-18s %s\n' 'make preview' 'Preview built renderer'
	@printf '  %-18s %s\n' 'make typecheck' 'Run TypeScript checks'
	@printf '  %-18s %s\n' 'make lint' 'Run ESLint'
	@printf '  %-18s %s\n' 'make test' 'Run unit tests'
	@printf '  %-18s %s\n' 'make coverage' 'Run unit tests with 100% core coverage thresholds'
	@printf '  %-18s %s\n' 'make audit' 'Run npm audit'
	@printf '  %-18s %s\n' 'make check' 'Run typecheck, lint, coverage, build, and audit'
	@printf '  %-18s %s\n' 'make verify' 'Alias for make check'
	@printf '  %-18s %s\n' 'make clean' 'Remove local build artifacts'

install:
	$(NPM) install

ci:
	$(NPM) ci

dev:
	$(NPM) run dev

electron:
	$(NPM) run electron

run:
	$(NPM) start

start: run

build:
	$(NPM) run build

package: package-current

package-dir:
	$(NPM) run package:dir

package-mac:
	$(NPM) run package:mac

package-win:
	$(NPM) run package:win

package-current:
	$(NPM) run package:current

package-all: package-mac package-win

preview:
	$(NPM) run preview

typecheck:
	$(NPM) run typecheck

lint:
	$(NPM) run lint

test:
	$(NPM) test

coverage:
	$(NPM) run coverage

audit:
	$(NPM) audit

check: typecheck lint coverage build audit

verify: check

clean:
	rm -rf .electron dist coverage release
