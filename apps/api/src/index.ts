import { serve } from "@hono/node-server";
import createApp from "./lib/create-app.ts";
import airQualityRouter from "./routes/air-quality/air-quality.index.ts";
import env from "./env.ts";

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
