import CurationStrategy from "./CurationStrategy";
import type { CurationUpdate, InteractionEvent } from "@/validation";
import assert from "assert";
import type Redis from "ioredis";
import logger from "@/lib/logger";

export default class AggregateTopicStrategy extends CurationStrategy {
  private STABILITY_MINIMUM_DEM = 5.0;
  private THRESHOLD = 0.2;

  constructor(redis: Redis) {
    super(redis);
  }

  override async process(
    event: InteractionEvent,
  ): Promise<CurationUpdate | null> {
    assert(event.type === "modify_topic");
    const { topic, userWeight: weight } = event;
    const hash_key = `curation:${event.contentId}:topics_data`;

    const all_data = await this.redis.hgetall(hash_key);

    const weights: Record<string, number> = {};
    let total_weight = 0;

    for (const [field, value] of Object.entries(all_data)) {
      const w = parseFloat(value);
      if (isNaN(w)) continue;

      weights[field] = w;
      total_weight += w;
    }

    const old_topic_weight = weights[topic] ?? 0;
    const old_relative = total_weight > 0 ? old_topic_weight / total_weight : 0;

    // Apply new event weight, no decay
    const new_topic_weight = Math.max(old_topic_weight + weight, 0);
    weights[topic] = new_topic_weight;

    const new_total_weight = total_weight - old_topic_weight + new_topic_weight;
    const new_relative =
      new_total_weight > 0 ? new_topic_weight / new_total_weight : 0;

    for (const [t, w] of Object.entries(weights)) {
      if (w <= 0) {
        delete weights[t];
        await this.redis.hdel(hash_key, t); // remove from Redis
      }
    }

    const update_payload: Record<string, string> = {};

    for (const [t, w] of Object.entries(weights)) {
      update_payload[t] = w.toString();
    }

    logger.debug(
      `Updating ${event.contentId} with ${JSON.stringify(update_payload)}`,
    );
    await this.redis.hset(hash_key, update_payload);

    // Stability check
    if (new_total_weight < this.STABILITY_MINIMUM_DEM) return null;

    // Threshold logic
    if (new_relative > this.THRESHOLD) {
      return {
        coordinationId: event.coordinationId,
        contentId: event.contentId,
        reason: `Topic "${topic}" crossed inclusion threshold (${new_relative} > ${this.THRESHOLD}).`,
        type: "topic_list_updated",
        topic,
        action: "added",
      };
    }

    if (new_relative < this.THRESHOLD && old_relative > this.THRESHOLD) {
      return {
        coordinationId: event.coordinationId,
        contentId: event.contentId,
        reason: `Topic "${topic}" dropped below exclusion threshold (${new_relative} < ${this.THRESHOLD}).`,
        type: "topic_list_updated",
        topic,
        action: "removed",
      };
    }

    return null;
  }
}
