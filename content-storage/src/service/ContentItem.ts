import ContentItemSubmission from "@/models/ContentItemSubmission";
import type { ContentSubmissionBody } from "../validation/content";
import type { BaseHeaders, BaseProtectedHeaders } from "../validation/headers";
import ContentItem from "@/models/ContentItem";
import logger from "@/lib/logger";
import type { IContentItem } from "@/types/ContentItem";

export async function submitContent(
  headers: BaseProtectedHeaders,
  { submitted_at, topics, ...item }: ContentSubmissionBody,
): Promise<string> {
  let content = await ContentItem.findOne({ source_url: item.source_url });

  if (!content) {
    content = new ContentItem(item);
    await content.save();
  }

  // Add a submission
  const submission = new ContentItemSubmission({
    content_id: content._id,
    user_id: headers["CureIt-User-Id"],
    submitted_at,
    topics,
  });

  await submission.save();
  logger.info(`Printing ${content.slug}`);
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
