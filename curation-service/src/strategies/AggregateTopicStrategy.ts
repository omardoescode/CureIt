import CurationStrategy from "./CurationStrategy";
import moment from "moment";
import type { CurationUpdate, InteractionEvent } from "@/validation";
import assert from "assert";
import type Redis from "ioredis";
import logger from "@/lib/logger";

export default class AggregateTopicStrategy extends CurationStrategy {
  private TIME_DECAY_FACTOR = 0.5;
  private THRESHOLD = 0.2;
  private STABILITY_MINIMUM_DEM = 5.0;
  private timestamp_key = "_last_update";

  constructor(redis: Redis) {
    super(redis);
  }

  private calc_delayed_weight(old_weight: number, dt_ms: number): number {
    const dt_seconds = dt_ms / 1000;
    return old_weight * Math.exp(-this.TIME_DECAY_FACTOR * dt_seconds);
  }

  get_key = (content_id: string) => `curation:${content_id}:topics`

  override async process(
    event: InteractionEvent,
  ): Promise<CurationUpdate | null> {
    assert(event.type === "modify_topic");
    const { topic, user_weight: weight } = event;
    const now = moment(event.timestamp);
    const hash_key = this.get_key(event.content_id);

    const all_data = await this.redis.hgetall(hash_key);

    const last_update_str = all_data[this.timestamp_key];
    const last_update = last_update_str ? moment(last_update_str) : now;
    const dt_ms = now.diff(last_update);

    const decayed_weights: Record<string, number> = {};
    let total_weight = 0;

    for (const [field, value] of Object.entries(all_data)) {
      if (field === this.timestamp_key) continue;

      const old_weight = parseFloat(value);
      if (isNaN(old_weight)) continue;

      const decayed = this.calc_delayed_weight(old_weight, dt_ms);
      decayed_weights[field] = decayed;
      total_weight += decayed;
    }

    const old_topic_weight = decayed_weights[topic] ?? 0;
    const old_relative = total_weight > 0 ? old_topic_weight / total_weight : 0;

    const new_topic_weight = Math.max(old_topic_weight + weight, 0);
    decayed_weights[topic] = new_topic_weight;

    const new_total_weight = total_weight - old_topic_weight + new_topic_weight;
    const new_relative =
      new_total_weight > 0 ? new_topic_weight / new_total_weight : 0;

    const update_payload: Record<string, string> = {
      [this.timestamp_key]: now.toISOString(),
    };

    for (const [field, wgt] of Object.entries(decayed_weights)) {
      update_payload[field] = wgt.toString();
    }

    logger.info(update_payload);
    await this.redis.hset(hash_key, update_payload);

    if (new_total_weight < this.STABILITY_MINIMUM_DEM) return null;
    if (new_relative > this.THRESHOLD && old_relative <= this.THRESHOLD) {
      return {
        content_id: event.content_id,
        reason: `Topic "${topic}" crossed inclusion threshold (${this.THRESHOLD}).`,
        type: 'topic_list_updated',
        topic: topic,
        action: "added",
      };
    }

    if (new_relative < this.THRESHOLD && old_relative >= this.THRESHOLD) {
      return {
        content_id: event.content_id,
        reason: `Topic "${topic}" dropped below exclusion threshold (${this.THRESHOLD}).`,
        type: 'topic_list_updated',
        topic: topic,
        action: "removed",
      };
    }

    return null;
  }
}
