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
export type BlockType = 'text' | 'image' | 'video' | 'title' | 'byline';
export interface GridPlacement {
    colStart: number;
    colSpan: number;
}
export interface ContentBlockBase {
    id: string;
    type: BlockType;
    order: number;
    layout: GridPlacement;
}
export interface BylineBlock extends ContentBlockBase {
    type: 'byline';
    author: string;
    publishedAt?: string;
}
export interface TitleBlock extends ContentBlockBase {
    type: 'title';
    text: string;
}
export interface TextBlock extends ContentBlockBase {
    type: 'text';
    text: string;
}
export interface ImageBlock extends ContentBlockBase {
    type: 'image';
    src: string;
    alt?: string;
    mediaHandle?: string | null;
}
export type BlockUpdate = {
    layout?: GridPlacement;
    text?: string;
    src?: string;
    alt?: string;
    mediaHandle?: string | null;
    author?: string;
    format?: string;
    publishedAt?: string;
};
export type AnyBlock = TextBlock | ImageBlock | BylineBlock | TitleBlock;
export interface PageContentResponse {
    id: string;
    slug: string;
    title: string;
    status: 'draft' | 'published';
    updatedAt: string;
    version: number;
    blocks: AnyBlock[];
}
export interface DirectoryMeta {
    directory: string | null;
    itemCount: number;
    lastUploaded: string | null;
}
export type ViewMode = 'list' | 'grid' | 'details';
//# sourceMappingURL=content-block.model.d.ts.map