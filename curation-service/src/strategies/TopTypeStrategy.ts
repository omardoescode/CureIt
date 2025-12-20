import type { CurationUpdate, InteractionEvent } from "@/validation";
import assert from "assert";
import CurationStrategy from "./CurationStrategy";

export default class TopTypeStrategy extends CurationStrategy {
  get_key(content_id: string) {
    return `curation:${content_id}:type_scores`;
  }
  override async process(
    event: InteractionEvent,
  ): Promise<CurationUpdate | null> {
    assert(event.type === "modify_type");
    const hashkey = this.get_key(event.contentId);
    const hashmap = await this.redis.hgetall(hashkey);
    const current_score = parseInt(hashmap[event.contentType] || "0", 10);
    const new_score = current_score + event.userWeight;

    await this.redis.hset(hashkey, event.contentType, new_score.toString());

    for (const score of Object.values(hashmap)) {
      const other_score = parseInt(score, 10);
      if (new_score <= other_score) {
        return null;
      }
    }

    return {
      coordinationId: event.coordinationId,
      contentId: event.contentId,
      reason: `Content type updated to ${event.contentType} with top score ${new_score}.`,
      type: "content_type_update",
      newType: event.contentType,
    };
  }
}
