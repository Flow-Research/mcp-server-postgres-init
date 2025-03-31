# MCP Server: PostgreSQL Docker Initializer

This project implements a Model Context Protocol (MCP) server that provides a tool to initialize a PostgreSQL database running inside a new Docker container.

The server exposes a single tool, `init-postgres-docker`, which takes a database name as input and performs the following actions:

*   Pulls the `postgres:latest` Docker image if not already present.
*   Creates a new Docker container running PostgreSQL.
*   Configures the container with the specified database name (`dbName`), a default user (`pguser`), and a default password (`mysecretpassword` - **Note: This is insecure and for demonstration purposes only**).
*   Maps the container's internal port 5432 to a random available port on the host machine.
*   Sets the container to be automatically removed when stopped (`AutoRemove: true`).
*   Returns a success message including the PostgreSQL connection URL (e.g., `postgresql://pguser:mysecretpassword@localhost:<hostPort>/<dbName>`).

## Prerequisites

*   Node.js and npm (or a compatible package manager)
*   Docker (must be running)
*   Make

## Usage with Makefile

A `Makefile` is provided for common tasks. Run these commands from the root directory of this project (`mcp-server-postgres-init`):

*   **Install Dependencies:**
    ```bash
    make install
    ```
    (Runs `npm install`)

*   **Build the Project:**
    ```bash
    make build
    ```
    (Runs `npm run build`, which compiles TypeScript to JavaScript in the `build/` directory)

*   **Inspect the Server:**
    ```bash
    make inspect
    ```
    (Runs `make build` first, then starts the MCP inspector using `npx @modelcontextprotocol/inspector node build/index.js`. You can then send a request to the `init-postgres-docker` tool.)

*   **Install, Build, and Inspect (Default):**
    ```bash
    make
    ```
    or
    ```bash
    make all
    ```
    (Runs `make install`, `make build`, and `make inspect` sequentially)

*   **Clean Project:**
    ```bash
    make clean
    ```
    (Removes `node_modules`, `build`, and `*.tsbuildinfo` files)

## Running Manually

If you prefer not to use Make:

1.  Install dependencies: `npm install`
2.  Build the project: `npm run build`
3.  Run the server (e.g., with the inspector):
    ```bash
    npx @modelcontextprotocol/inspector node build/index.js
    ```
    Or run the server directly if connecting with a client:
    ```bash
    node build/index.js
    ```

## Important Notes

*   **Docker Must Be Running:** The Docker daemon needs to be active for this server to create containers.
*   **Password Security:** The default password (`mysecretpassword`) is hardcoded and insecure. For real-world use, implement a more secure method for handling passwords (e.g., generation, environment variables).
*   **Resource Management:** Containers are set to auto-remove. Consider the lifecycle needed for your use case.
