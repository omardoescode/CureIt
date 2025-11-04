import ContentItemSubmission from "@/models/ContentItemSubmission";
import type { ContentSubmissionBody } from "../validation/content";
import type { BaseHeaders } from "../validation/headers";
import ContentItem from "@/models/ContentItem";

export async function submitContent(
  headers: BaseHeaders,
  {
    author,
    title,
    extracted_at,
    is_private,
    source_url,
    type,
    markdown,
    submitted_at,
    topics,
  }: ContentSubmissionBody,
): Promise<string> {
  let content = await ContentItem.findOne({ source_url });

  if (!content) {
    content = new ContentItem({
      author,
      title,
      extracted_at,
      is_private,
      source_url,
      type,
      markdown,
    });
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
  return content._id;
}
