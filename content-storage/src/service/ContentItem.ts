import ContentItemSubmission from "@/models/ContentItemSubmission";
import type { BaseHeaders, BaseProtectedHeaders } from "../validation/headers";
import ContentItem from "@/models/ContentItem";
import logger from "@/lib/logger";
import type { IContentItem } from "@/types/ContentItem";
import type { SubmissionBody } from "@/validation/content_url";
import env from "@/utils/env";
import {
  ContentProcessingOutput,
  type ContentProcessingOuptut,
} from "@/validation/content";
import { AppError, InternalServerError } from "@/utils/error";

async function processContentUrl(
  content_url: string,
): Promise<ContentProcessingOuptut | InternalServerError> {
  const response = await fetch(
    `${env.CONTENT_PROCESSING_SERVICE_URL}/api/process`,
    {
      method: "POST",
      body: JSON.stringify({ content_url }),
    },
  );
  logger.info(`Processing content_url=${content_url}`);
  const json = await response.json();
  const parsed = ContentProcessingOutput.safeParse(json);

  if (parsed.error) {
    logger.error("content-processing service returned invalid json");
    logger.error(parsed.error.issues);
    return new InternalServerError();
  }

  return parsed.data;
}

export async function submitContent(
  headers: BaseProtectedHeaders,
  { submitted_at, topics, content_url, is_private }: SubmissionBody,
): Promise<string | InternalServerError> {
  let content = await ContentItem.findOne({ source_url: content_url });

  if (!content) {
    logger.info(
      `Content (content_url=${content_url}) not found in cache. Proceeding to processing step`,
    );
    const body = await processContentUrl(content_url);
    if (body instanceof AppError) return body;

    content = new ContentItem({ ...body, is_private });
    await content.save();
    logger.info(`Added a new content item: content_slug=${content.slug}`);
  }

  // Add a submission
  const submission = new ContentItemSubmission({
    content_id: content._id,
    user_id: headers["CureIt-User-Id"],
    submitted_at,
    topics,
  });

  await submission.save();
  return content.slug;
}

export async function getContentItem(
  headers: BaseHeaders,
  slug: string,
): Promise<IContentItem | null> {
  const content = await ContentItem.findOne({ slug });
  if (!content) return null;

  if (!content.is_private) return content;

  // Handle private case
  const user_id = headers["CureIt-User-Id"];
  if (!user_id) return null;

  const sub = await ContentItemSubmission.findOne({
    content_id: content._id,
    user_id,
  });

  return sub ? content : null;
}
