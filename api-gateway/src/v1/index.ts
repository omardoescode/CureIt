import { Hono } from "hono";
import FeedRouter from "./FeedRouter";
import AuthRouter from "./AuthRouter";
import ContentRouter from "./ContentRouter";
import InteractionRouter from "./InteractionRouter";

const v1app = new Hono();

v1app.route("/feed", FeedRouter);
v1app.route("/auth", AuthRouter);
v1app.route("/content", ContentRouter);
v1app.route("/interaction", InteractionRouter);

export default v1app;
