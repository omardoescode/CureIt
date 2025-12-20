import type { CurationUpdate, InteractionEvent } from "@/validation";
import CurationStrategy from "./CurationStrategy";
import assert from "assert";
import type Redis from "ioredis";

// TODO: change this strategy to something better later
export default class ItemVoteStrategy extends CurationStrategy {
  constructor(
    redis: Redis,
    private type: "upvote" | "downvote",
  ) {
    super(redis);
  }
  override async process(
    event: InteractionEvent,
  ): Promise<CurationUpdate | null> {
    assert(event.type === this.type, "Invalid event type for ItemVoteStrategy");

    return {
      coordinationId: event.coordinationId,
      contentId: event.contentId,
      reason: "Content item received a vote.",
      value: event.userWeight,
      type:
        this.type === "upvote" ? "item_upvote_update" : "item_downvote_update",
    };
  }
}
