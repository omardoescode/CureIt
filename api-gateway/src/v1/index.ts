import env from "@/env";
import { Hono } from "hono";
import { type StatusCode } from "hono/utils/http-status";
import logger from "@/lib/logger";
import { getUserId } from "./helpers";
import FeedRouter from "./FeedRouter";
import AuthRouter from "./AuthRouter";
import ContentRouter from "./ContentRouter";

const v1app = new Hono();

v1app.route("/feed", FeedRouter);
v1app.route("/auth", AuthRouter);
v1app.route("/content", ContentRouter);

export default v1app;
