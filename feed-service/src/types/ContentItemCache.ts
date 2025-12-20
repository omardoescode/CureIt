export interface ContentCache {
  slug: string;
  source_url: string;
  type: string;
  title: string;
  page_title: string;
  page_description: string | null;
  page_author: string | null;
  extracted_at: string;
  created_at: string;
  topics: string[];
  upvotes: number;
  downvotes: number;

  // NOTE: this is for payload information. The feed service needn't be aware of them, for now that is
  [k: string]: unknown;
}
