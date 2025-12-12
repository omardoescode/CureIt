import env from "@/env";
import type { ContentCache } from "@/types/ContentItemCache";

export class NotFoundInStorage extends Error {
  constructor(contentId: string) {
    super(`Content Item (contentId=${contentId}) not found in storage`);
  }
}

// TODO: Add support for content storage to query exact values
export const ContentStorageClient = {
  async fetchContentItem(
    coordinationId: string,
    contentId: string,
  ): Promise<ContentCache | NotFoundInStorage> {
    const headers = {
      "CureIt-Coordination-Id": coordinationId,
    };

    const res = await fetch(
      `${env.CONTENT_STORAGE_URL}/api/internal/content/metadata/${contentId}`,
      {
        headers,
      },
    );

    if (res.status === 404) return new NotFoundInStorage(contentId);

    const parsed = await res.json();
    return parsed as ContentCache;
  },
};
