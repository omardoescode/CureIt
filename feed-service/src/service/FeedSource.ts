import type { FeedCursor } from "@/types/Feed";
import type { FeedRanker } from "./FeedRanker";

export interface FeedSource {
  add(
    contentId: string,
    data: { upvotes: number; downvotes: number; createdAt: Date },
  ): Promise<void>;
  fetchPage(
    limit: number,
    cursor: FeedCursor | null,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }>;
}
