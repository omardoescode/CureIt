import type CurationStrategy from "./strategies/CurationStrategy";
import ModifyTopicStrategy from "./strategies/AggregateTopicStrategy";
import type {
  CurationUpdate,
  InteractionEvent,
  InteractionType,
} from "./validation";
import type { Producer } from "kafkajs";
import type { Redis } from "ioredis";
import logger from "./lib/logger";
import TopTypeStrategy from "./strategies/TopTypeStrategy";
import ItemVoteStrategy from "./strategies/ItemVoteStrategy";
import env from "./env";

// TODO: Handle failure through a queue (in redis is better)
export default class CurationService {
  private strategies: Map<InteractionType, CurationStrategy>;

  constructor(
    redis: Redis,
    private producer: Producer,
  ) {
    this.strategies = new Map();
    this.strategies.set("modify_topic", new ModifyTopicStrategy(redis));
    this.strategies.set("modify_type", new TopTypeStrategy(redis));
    this.strategies.set("vote", new ItemVoteStrategy(redis));
  }

  public async handle_event(event: InteractionEvent) {
    const strategy = this.strategies.get(event.type);
    if (!strategy) {
      logger.warn(`No strategy found for ${event.type}`);
      return;
    }

    const payload = await strategy.process(event);
    if (payload) {
      const { reason, ...rest } = payload;
      logger.info(
        `Emitting curation update for content_id=${rest.contentId}. reason=${reason}`,
      );
      await this.emitEvent(rest);
    }
  }
  private async emitEvent(evt: Omit<CurationUpdate, "reason">) {
    const { contentId: content_id, ...rest } = evt;
    await this.producer.send({
      topic: env.KAFKA_CURATION_UPDATE_TOPIC_NAME,
      messages: [
        {
          key: content_id,
          value: JSON.stringify(rest),
        },
      ],
    });
  }
}
