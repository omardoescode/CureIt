import type { FeedCursor } from "@/types/Feed";

export interface FeedSource {
  add(contentId: string, score: number): Promise<void>;
  fetchPage(
    limit: number,
    cursor: FeedCursor | null,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }>;
}
