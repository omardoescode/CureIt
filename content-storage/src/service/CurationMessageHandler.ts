import type { CurationUpdateEvent } from "@/validation/curation";
import BaseContentItem from "@/models/ContentItem";
import { producer } from "@/lib/kakfa";
import env from "@/utils/env";
import type { ContentUpdateEvent } from "@/validation/storage_update_event";
import { contentTypes, type ContentType } from "@/types/ContentItem";
import logger from "@/lib/logger";

const send = (message: Omit<ContentUpdateEvent, "type">) =>
  producer.send({
    topic: env.KAFKA_CONTENT_UPDATE_TOPIC_NAME,
    messages: [
      {
        value: JSON.stringify({ ...message, type: "content_updated" }),
      },
    ],
  });

export const CurationUpdateHandler = {
  async handle(message: CurationUpdateEvent) {
    switch (message.type) {
      case "item_upvote_update":
        {
          const updatedItem = await BaseContentItem.findByIdAndUpdate(
            message.content_id,
            { $inc: { upvotes: message.incr } },
            { returnDocument: "after" },
          ).lean();

          if (updatedItem) {
            const upvotes = updatedItem.upvotes;
            await send({
              contentId: message.content_id,
              coordinationId: message.coordination_id,
              upvotes,
            });
          }
        }
        break;

      case "item_downvote_update":
        {
          const updatedItem = await BaseContentItem.findByIdAndUpdate(
            message.content_id,
            { $inc: { downvotes: message.decr } },
            { returnDocument: "after" },
          ).lean();

          if (updatedItem) {
            const downvotes = updatedItem.upvotes;
            await send({
              contentId: message.content_id,
              coordinationId: message.coordination_id,
              downvotes,
            });
          }
        }
        break;

      case "topic_list_updated": {
        const update =
          message.action === "added"
            ? { $addToSet: { topics: message.topic } }
            : { $pull: { topics: message.topic } };

        await BaseContentItem.updateOne({ _id: message.content_id }, update);

        const updatedItem = await BaseContentItem.findById(message.content_id)
          .lean()
          .select("topics");

        if (updatedItem) {
          await send({
            contentId: message.content_id,
            coordinationId: message.coordination_id,
            topics: updatedItem.topics,
          });
        }
        break;
      }

      case "content_type_update": {
        if (!contentTypes.includes(message.new_type as ContentType)) {
          logger.warn(
            `Invalid content type update: invalid value of type (${message.new_type})`,
          );
          return;
        }
        const result = await BaseContentItem.updateOne(
          { _id: message.content_id },
          { $set: { type: message.new_type } },
        );

        if (result.modifiedCount > 0) {
          // TODO: Create a method in content processing, that already has a type in mind
          // WARN: In later phase anyway
          await send({
            contentId: message.content_id,
            coordinationId: message.coordination_id,
            contentType: message.new_type,
          });
        }
        break;
      }
    }
  },
};
