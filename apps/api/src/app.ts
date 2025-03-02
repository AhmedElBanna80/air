import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { rootContainer } from "./di-container";
import env from "./env";
import { honoMiddleware } from "./middlewares/middleware";
import { pinoLogger } from "./middlewares/pino-logger";
import { indexRoute } from "./routes";
import { closeDatabase } from "./services/db/database.provider";

// Create Hono app
const app = new Hono();

// Apply middleware
app.use("*", cors({
  origin: ["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"],
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length", "X-Requested-With"],
  maxAge: 86400,
  credentials: true,
}));
app.use(honoMiddleware(rootContainer, app));
app.use(pinoLogger());
app.route("/", indexRoute);

const server = serve({
  fetch: app.fetch,
  port: env.PORT,
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await gracefulShutdown();
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await gracefulShutdown();
});

async function gracefulShutdown() {
  server.close(() => {
    console.log('HTTP server closed');
  });

  try {
    // Close database connections
    await closeDatabase();
    console.log('Database connections closed');
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  
  process.exit(0);
}
