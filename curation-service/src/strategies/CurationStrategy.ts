import type { CurationUpdate, InteractionEvent } from "@/validation";
import type Redis from "ioredis";

export default abstract class CurationStrategy {
  constructor(protected redis: Redis) { }

  abstract process(event: InteractionEvent): Promise<CurationUpdate | null>;
}
