import { Hono } from "hono";
import v1app from "./v1";

const app = new Hono().basePath("/api");

app.route("/v1/", v1app);

export default app;

