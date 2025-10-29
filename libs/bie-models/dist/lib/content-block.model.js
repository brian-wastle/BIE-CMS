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
export {};
