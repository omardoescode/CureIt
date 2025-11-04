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
    // submitted_at,
    // topics
  }: ContentSubmissionBody,
): Promise<string> {
  const cnt = new ContentItem({
    author,
    title,
    extracted_at,
    is_private,
    source_url,
    type,
    markdown,
  });

  await cnt.save();
  return cnt._id;
}
