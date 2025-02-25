import { serve } from "@hono/node-server";

import env from "./env.ts";
import createApp from "./lib/create-app.ts";
import { LOGGER } from "./middlewares/pino-logger.ts";
import airQualityRouter from "./routes/air-quality/air-quality.index.ts";

const app = createApp();

// Mount the air quality router at /api/air-quality
app.route("/api", airQualityRouter);

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  () => {
    LOGGER.info(`Server is running on http://localhost:${env.PORT}`);
  },
);
