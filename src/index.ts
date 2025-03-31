import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Docker from 'dockerode';

// Initialize Docker client
const docker = new Docker(); // Assumes Docker is running and accessible via default socket

// --- Server Definition ---
const server = new McpServer({
    name: "mcp-server-postgres-init",
    version: "1.0.0",
});

// --- Tool Definition ---
server.tool(
    "init-postgres-docker",
    "Initializes a PostgreSQL database inside a new Docker container.",
    {
        dbName: z.string().min(1).describe("The desired name for the PostgreSQL database.")
    },
    async ({ dbName }) => {
        const dbUser = "pguser";
        const dbPassword = "mysecretpassword"; // TODO: Make this configurable or randomly generated
        const containerName = `postgres-${dbName}-${Date.now()}`;
        const exposedPort = 5432; // Default PostgreSQL port

        try {
            console.error("Pulling PostgreSQL image...");
            await pullPostgresImage('postgres:latest'); // Ensure image is available

            console.error("Creating PostgreSQL container...");
            console.error(`Attempting to create container: ${containerName} for db: ${dbName}`);

            const container = await docker.createContainer({
                Image: 'postgres:latest',
                name: containerName,
                Env: [
                    `POSTGRES_DB=${dbName}`,
                    `POSTGRES_PASSWORD=${dbPassword}`,
                    `POSTGRES_USER=${dbUser}`
                ],
                ExposedPorts: { [`${exposedPort}/tcp`]: {} },
                HostConfig: {
                    PortBindings: {
                        [`${exposedPort}/tcp`]: [{ HostPort: '0' }] // Assign a random available host port
                    },
                    AutoRemove: true, // Remove container when stopped
                }
            });

            console.error("Starting container...", container.id);
            await container.start();
            console.error(`Container ${container.id} started.`);

            // Inspect container to get the dynamically assigned host port
            const data = await container.inspect();
            const hostPort = data.NetworkSettings.Ports[`${exposedPort}/tcp`]?.[0]?.HostPort;

            if (!hostPort) {
                throw new Error('Could not determine assigned host port for PostgreSQL container.');
            }

            const connectionUrl = `postgresql://postgres:${dbPassword}@localhost:${hostPort}/${dbName}`;
            const successMsg = `PostgreSQL container '${containerName}' started successfully. DB: ${dbName}. Connection URL: ${connectionUrl}`;
            console.error(successMsg);

            return {
                content: [
                    {
                        type: "text",
                        text: successMsg,
                    }
                ]
            };

        } catch (error: any) {
            console.error(`Error initializing PostgreSQL container: ${error.message}`);
            console.error(error.stack);
            const errorMsg = `Failed to initialize PostgreSQL container: ${error.message}`;
            return {
                content: [
                    {
                        type: "text",
                        text: errorMsg,
                    }
                ]
            };
        }
    }
);


// Helper function to pull image
async function pullPostgresImage(imageName: string): Promise<void> {
    return new Promise((resolve, reject) => {
        docker.pull(imageName, (err: Error, stream: NodeJS.ReadableStream) => {
            if (err) {
                return reject(err);
            }
            docker.modem.followProgress(stream, (err, output) => {
                if (err) {
                    return reject(err);
                }
                // You could report progress here using `output` if needed
                console.error("Image pull finished.");
                resolve();
            });
        });
    });
}


// --- Main Execution ---
async function main() {
    const transport = new StdioServerTransport();
    try {
        await server.connect(transport);
        console.error(`MCP Server postgres-init started and listening via stdio.`);
    } catch (error) {
        console.error(`Failed to connect server: ${error}`);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
