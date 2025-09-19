/**
 * Shared content model + read API contract
 * ---------------------------------------
 * The SSR renderer and the canvas editor both consume page content through the
 * "read" API. The endpoint returns a JSON payload that conforms to the
 * interfaces defined in this file, which keeps authoring, preview, and public
 * rendering in sync.
 *
 * GET /api/pages/:id  ->  PageContentResponse
 *
 * Required guarantees for consumers:
 * - `blocks` is ordered ascending by `order`; no additional client-side sort is
 *   necessary before rendering.
 * - `layout` values are always 1-based column indices compatible with CSS grid
 *   `grid-column`. SSR must respect these values when building HTML.
 * - Any new block type added to {@link BlockType} must extend
 *   {@link ContentBlockBase} and be included in {@link AnyBlock} so all clients
 *   can render it.
 */

export type BlockType = 'text' | 'image' | 'video' | 'carousel' | 'byline';

export interface GridPlacement {
  colStart: number; // Starting column
  colSpan: number; // Width in columns
}
export interface ContentBlockBase {
  id: string;
  type: BlockType;
  order: number;
  layout: GridPlacement;
}

export interface TextBlock extends ContentBlockBase {
  type: 'text';
  text: string; // HTML string from Quill
}

export interface ImageBlock extends ContentBlockBase {
  type: 'image';
  src: string;
  alt?: string;
}

export interface BylineBlock extends ContentBlockBase {
  type: 'byline';
  author: string;           // Display name of the author
  publishedAt?: string;     // ISO timestamp filled in when the post publishes
}

export type BlockUpdate = {
  layout?: GridPlacement;
  text?: string;
  src?: string;
  alt?: string;
  author?: string;
  format?: string;
  publishedAt?: string;
};

export type AnyBlock = TextBlock | ImageBlock | BylineBlock;    // Used during component creation/editing

/**
 * Contract for the read-only page endpoint consumed by SSR and the canvas app.
 */
export interface PageContentResponse {
  id: string;             // Stable document identifier (UUID or slug)
  slug: string;           // Public-facing slug used by the blog route
  title: string;          // Page/browser title
  status: 'draft' | 'published'; // Drives visibility in the public renderer
  updatedAt: string;      // ISO timestamp for cache invalidation
  version: number;        // Monotonic schema/content version
  blocks: AnyBlock[];     // Inline-ordered block payload
}

