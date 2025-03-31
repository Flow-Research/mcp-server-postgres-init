# Prevent make from interpreting targets as files
.PHONY: all install build inspect clean

# Default target: Install dependencies and build the project
all: install build inspect

# Install npm dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Build the TypeScript project (assumes 'build' script in package.json)
build:
	@echo "Building project..."
	npm run build

# Run the MCP inspector against the built server
inspect: build # Ensure the project is built first
	@echo "Running MCP Inspector..."
	npx @modelcontextprotocol/inspector node build/index.js

# Clean build artifacts and installed dependencies
clean:
	@echo "Cleaning build artifacts and node_modules..."
	rm -rf build node_modules *.tsbuildinfo # Assuming build is the only output dir
