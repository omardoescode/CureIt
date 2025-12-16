import type { FeedCursor } from "@/types/Feed";

export type FilterEntry = {
  eq?: string | number | boolean | Date;
  lte?: number | Date;
  gte?: number | Date;
};
export type FeedFilter = Record<string, Partial<FilterEntry>>;

export interface FeedSource {
  add(
    contentId: string,
    score: number,
    meta?: Record<string, string | number | boolean | Date>,
  ): Promise<void>;
  fetchPage(
    limit: number,
    cursor: FeedCursor | null,
    filters?: FeedFilter,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }>;
}
