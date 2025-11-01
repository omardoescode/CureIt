import type { ContentSubmissionBody } from "../validation/content";
import type { BaseHeaders } from "../validation/headers";

export async function submitContent(
  headers: BaseHeaders,
  body: ContentSubmissionBody,
): Promise<void> {
  console.log(headers, body);
}
