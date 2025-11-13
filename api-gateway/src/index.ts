import { Hono } from "hono";
import v1app from "./v1";
import env from "./env";
import { logger as logMiddlware } from "hono/logger";

const app = new Hono().basePath("/api");
app.use(logMiddlware());

app.route("/v1/", v1app);

export default {
  fetch: app.fetch,
  port: env.PORT,
};
