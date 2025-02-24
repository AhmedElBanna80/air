import { serve } from "@hono/node-server";
import createApp from "./lib/create-app.js";
import airQualityRouter from "./routes/air-quality/air-quality.index.js";
import env from "./env.js";

const app = createApp();
app.route("/api", airQualityRouter);

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  () => {
    console.log(`Server is running on http://localhost:${env.PORT}`);
  },
);
