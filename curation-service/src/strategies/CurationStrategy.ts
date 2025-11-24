import type { InteractionEvent } from "@/validation";
import type { RedisClientType } from "redis";

export interface CurationUpdate {
  contentId: string;
  fieldToUpdate: "type" | "topic" | "status" | "score";
  newValue: unknown;
  confidenceScore: number;
  reason: string;
}

export default abstract class CurationStrategy {
  constructor(protected redis: RedisClientType) {}

  abstract process(event: InteractionEvent): Promise<CurationUpdate | null>;

  protected get_key(identifier: string) {
    return `curation:${identifier}`;
  }
}
