import ContentItemSubmission from "@/models/ContentItemSubmission";
import type { BaseHeaders, BaseProtectedHeaders } from "../validation/headers";
import ContentItem from "@/models/ContentItem";
import logger from "@/lib/logger";
import type { IBaseContentItem, IContentItem } from "@/types/ContentItem";
import type { SubmissionBody } from "@/validation/content_url";
import env from "@/utils/env";
import {
  ContentProcessingOutput,
  type ContentProcessingOuptut,
} from "@/validation/content";
import { AppError, InternalServerError, InvalidData } from "@/utils/error";
import { contentCreationProducer } from "@/lib/kakfa";

async function processContentUrl(
  content_url: string,
  coordination_id: string,
): Promise<ContentProcessingOuptut | InternalServerError | InvalidData> {
  const response = await fetch(
    `${env.CONTENT_PROCESSING_SERVICE_URL}/api/process`,
    {
      method: "POST",
      body: JSON.stringify({ content_url }),
      headers: {
        "Content-Type": "application/json",
        "CureIt-Coordination-Id": coordination_id,
      },
    },
  );

  if (response.status === 400) return new InvalidData("Invaild data");

  logger.info(`Processing content_url=${content_url}`);
  const json = await response.json();
  const parsed = ContentProcessingOutput.safeParse(json);

  if (parsed.error) {
    const sample = { ...json };
    delete sample["markdown"];
    logger.debug(
      `content-processing service returned invalid json: ${JSON.stringify(sample)}`,
    );
    logger.error(parsed.error.issues);
    return new InternalServerError();
  }

  return parsed.data;
}

export async function submitContent(
  headers: BaseProtectedHeaders,
  { submitted_at, content_url, is_private, topics }: SubmissionBody,
): Promise<string | InternalServerError> {
  let content = await ContentItem.findOne({ source_url: content_url });

  if (!content) {
    logger.info(
      `Content (content_url=${content_url}) not found in cache. Proceeding to processing step`,
    );
    const body = await processContentUrl(
      content_url,
      headers["CureIt-Coordination-Id"],
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
    contentCreationProducer.send({
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
