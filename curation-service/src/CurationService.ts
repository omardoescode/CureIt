import type CurationStrategy from "./strategies/CurationStrategy";
import ModifyTopicStrategy from "./strategies/AggregateTopicStrategy";
import type { InteractionEvent, InteractionType } from "./validation";
import type { Producer } from "kafkajs";
import type { CurationUpdate } from "./strategies/CurationStrategy";
import type { Redis } from "ioredis";
import logger from "./lib/logger";

export default class CurationService {
  private strategies: Map<InteractionType, CurationStrategy>;

  constructor(
    redis: Redis,
    private producer: Producer,
  ) {
    this.strategies = new Map();
    this.strategies.set("modify_topic", new ModifyTopicStrategy(redis));
  }

  public async handle_event(event: InteractionEvent) {
    const strategy = this.strategies.get(event.type);
    if (!strategy) {
      // TODO: Warn using logger
      logger.warn(`No strategy found for ${event.type}`);
      return;
    }

    const payload = await strategy.process(event);
    logger.info(payload);
    if (payload) {
      this.emitEvent(payload);
    }
  }
  private emitEvent(_: CurationUpdate) {
    // TODO: emit the event, and maintain a queue if it doesn't connect
  }
}
