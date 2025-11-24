import type { RedisClientType } from "redis";
import type CurationStrategy from "./strategies/CurationStrategy";
import ModifyTopicStrategy from "./strategies/AggregateTopicStrategy.ts";
import type { InteractionEvent, InteractionType } from "./validation";
import type { Producer } from "kafkajs";
import type { CurationUpdate } from "./strategies/CurationStrategy";

export default class CurationService {
  private strategies: Map<InteractionType, CurationStrategy>;

  constructor(
    redis: RedisClientType,
    private producer: Producer,
  ) {
    this.strategies = new Map();
    this.strategies.set("modify_topic", new ModifyTopicStrategy(redis));
  }

  public async handle_event(event: InteractionEvent) {
    const strategy = this.strategies.get(event.type);
    if (!strategy) {
      // TODO: Warn using logger
      return;
    }

    const payload = strategy.process(event);
    if (payload) emitEvent(payload);
  }
  emitEvent(_: CurationUpdate) {
    // TODO: emit the event, and maintain a queue if it doesn't connect
  }
}
