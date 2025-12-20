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
            message.contentId,
            { $inc: { upvotes: message.value } },
            { returnDocument: "after" },
          ).lean();

          if (updatedItem) {
            const upvotes = updatedItem.upvotes;
            await send({
              contentId: message.contentId,
              coordinationId: message.coordinationId,
              upvotes,
            });
          }
        }
        break;

      case "item_downvote_update":
        {
          const updatedItem = await BaseContentItem.findByIdAndUpdate(
            message.contentId,
            { $inc: { downvotes: message.value } },
            { returnDocument: "after" },
          ).lean();

          if (updatedItem) {
            const downvotes = updatedItem.upvotes;
            await send({
              contentId: message.contentId,
              coordinationId: message.coordinationId,
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

        await BaseContentItem.updateOne({ _id: message.contentId }, update);

        const updatedItem = await BaseContentItem.findById(message.contentId)
          .lean()
          .select("topics");

        if (updatedItem) {
          await send({
            contentId: message.contentId,
            coordinationId: message.coordinationId,
            topics: updatedItem.topics,
          });
        }
        break;
      }

      case "content_type_update": {
        if (!contentTypes.includes(message.newType as ContentType)) {
          logger.warn(
            `Invalid content type update: invalid value of type (${message.newType})`,
          );
          return;
        }
        const result = await BaseContentItem.updateOne(
          { _id: message.contentId },
          { $set: { type: message.newType } },
        );

        if (result.modifiedCount > 0) {
          // TODO: Create a method in content processing, that already has a type in mind
          // WARN: In later phase anyway
          await send({
            contentId: message.contentId,
            coordinationId: message.coordinationId,
            contentType: message.newType,
          });
        }
        break;
      }
    }
  },
};
