import type { CurationUpdate, InteractionEvent } from "@/validation";
import CurationStrategy from "./CurationStrategy";
import assert from 'assert'

// TODO: change this strategy to something better later
export default class ItemVoteStrategy extends CurationStrategy {
  override async process(event: InteractionEvent): Promise<CurationUpdate | null> {
    assert(event.type === "vote", 'Invalid event type for ItemVoteStrategy');

    return {
      content_id: event.content_id,
      reason: "Content item received a vote.",
      incr: event.user_weight,
      type: 'item_vote_update',
    }
  }
}
