# Makefile for Open Food Facts Web Components
# This Makefile handles package publishing and git tagging

# Variables
PACKAGE_DIR = web-components
PACKAGE_JSON = $(PACKAGE_DIR)/package.json
VERSION = $(shell node -p "require('./$(PACKAGE_JSON)').version")
PACKAGE_NAME = $(shell node -p "require('./$(PACKAGE_JSON)').name")

# Default target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  publish     - Build, publish package to npm and create git tag"
	@echo "  build       - Build the package"
	@echo "  dev         - Run dev"
	@echo "  test        - Run tests"
	@echo "  clean       - Clean build artifacts"
	@echo "  version     - Show current version"
	@echo "  help        - Show this help message"

# Show current version
.PHONY: version
version:
	@echo "Current version: $(VERSION)"
	@echo "Package name: $(PACKAGE_NAME)"

# Build the package
.PHONY: build
build:
	@echo "Building package..."
	cd $(PACKAGE_DIR) && npm run prepare:packagen

# Run dev
.PHONY: dev
dev:
	@echo "Running dev..."
	cd $(PACKAGE_DIR) && npm run dev

# Run tests
.PHONY: test
test:
	@echo "Running tests..."
	cd $(PACKAGE_DIR) && npm test

# Clean build artifacts
.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	cd $(PACKAGE_DIR) && npm run clean

# Publish package and create git tag
.PHONY: publish
publish:
	@echo "Publishing $(PACKAGE_NAME) version $(VERSION)..."
	
	# Check if we're on main/master branch
	@BRANCH=$$(git rev-parse --abbrev-ref HEAD); \
	if [ "$$BRANCH" != "main" ] && [ "$$BRANCH" != "master" ]; then \
		echo "Warning: You are not on main/master branch (current: $$BRANCH)"; \
		read -p "Continue anyway? [y/N] " -n 1 -r; \
		echo; \
		if [[ ! $$REPLY =~ ^[Yy]$$ ]]; then \
			echo "Aborted."; \
			exit 1; \
		fi; \
	fi
	
	# Check if working directory is clean
	@if [ -n "$$(git status --porcelain)" ]; then \
		echo "Working directory is not clean. Please commit or stash changes."; \
		git status --short; \
		exit 1; \
	fi
	
	# Check if tag already exists
	@if git rev-parse "v$(VERSION)" >/dev/null 2>&1; then \
		echo "Tag v$(VERSION) already exists!"; \
		echo "Please update the version in $(PACKAGE_JSON) before publishing."; \
		exit 1; \
	fi
	
	# Publish to npm
	cd $(PACKAGE_DIR) && npm run publish:package
	
	# Create and push git tag
	git tag -a "v$(VERSION)" -m "Release version $(VERSION)"
	git push origin "v$(VERSION)"
	
	@echo ""
	@echo "✅ Successfully published $(PACKAGE_NAME) version $(VERSION)"
	@echo "✅ Created and pushed git tag v$(VERSION)"
	@echo ""
	@echo "Package published to: https://www.npmjs.com/package/$(PACKAGE_NAME)"
