import ContentItemSubmission from "@/models/ContentItemSubmission";
import type { BaseHeaders, BaseProtectedHeaders } from "../validation/headers";
import ContentItem from "@/models/ContentItem";
import logger from "@/lib/logger";
import type { IBaseContentItem, IContentItem } from "@/types/ContentItem";
import type { SubmissionBody } from "@/validation/content_url";
import env from "@/utils/env";
import { AppError, InternalServerError } from "@/utils/error";
import { producer } from "@/lib/kakfa";
import { ContentProcessingClient } from "./ContentProcessingClient";

export async function submitContent(
  headers: BaseProtectedHeaders,
  { submitted_at, content_url, is_private, topics }: SubmissionBody,
): Promise<string | InternalServerError> {
  let content = await ContentItem.findOne({ source_url: content_url });

  if (!content) {
    logger.info(
      `Content (content_url=${content_url}) not found in cache. Proceeding to processing step`,
    );
    const body = await ContentProcessingClient.process(
      headers["CureIt-Coordination-Id"],
      content_url,
    );
    if (body instanceof AppError) return body;

    content = new ContentItem({ ...body, topics });
    await content.save();
    logger.info(`Added a new content item: content_slug=${content.slug}`);
  }

  // Add a submission
  const submission = new ContentItemSubmission({
    content_id: content._id,
    user_id: headers["CureIt-User-Id"],
    submitted_at,
    is_private,
  });

  // TODO: send content only in case it's new only
  // DEBUGGING FOR NOW
  await Promise.all([
    submission.save(),
    producer.send({
      topic: env.KAFKA_CONTENT_CREATION_TOPIC_NAME,
      messages: [
        {
          value: JSON.stringify({
            type: "content_added",
            coordinationId: headers["CureIt-Coordination-Id"],
            contentId: content.id,
          }),
        },
      ],
    }),
  ]);

  return content.slug;
}

export async function getContentItemBySlug(
  headers: BaseHeaders,
  slug: string,
): Promise<IContentItem | null> {
  const content = await ContentItem.findOne({ slug });
  if (!content) return null;

  return content;
}

export async function getContentMetadata(
  _: BaseHeaders,
  id: string,
): Promise<IBaseContentItem | null> {
  const content = await ContentItem.findById(
    id,
    "slug source_url title page_title page_description page_author type extracted_at created_at topics upvotes downvotes",
  );
  return content ? content : null;
}
