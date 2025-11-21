import { z } from 'zod';
/** Common enums *************************************************************/
export const BlockTypeSchema = z.enum(['text', 'image', 'video', 'title', 'byline']);
export const AlignTypeSchema = z.enum(['flex-start', 'center', 'flex-end']);
export const BreakpointIdSchema = z.enum(['mobile', 'tablet', 'desktop']);
export const PageStatusSchema = z.enum(['draft', 'published']);
export const ViewModeSchema = z.enum(['list', 'grid']);
/** Layout + responsive helpers **********************************************/
export const GridPlacementSchema = z.object({
    row: z.coerce.number().int().nonnegative(), // Starting row
    colStart: z.coerce.number().int().nonnegative(), // Starting column
    colSpan: z.coerce.number().int().positive(), // Width in columns
    rowSpan: z.coerce.number().int().positive().optional(), // Height in rows
});
export const ResponsiveOverrideSchema = z.object({
    fontSize: z.coerce.number().nullable().optional(),
    layout: GridPlacementSchema.partial().optional(),
    hAlign: AlignTypeSchema.optional(),
    vAlign: AlignTypeSchema.optional(),
});
export const ResponsiveOverridesSchema = z
    .object({
    mobile: ResponsiveOverrideSchema.optional(),
    tablet: ResponsiveOverrideSchema.optional(),
    desktop: ResponsiveOverrideSchema.optional(),
})
    .partial();
export const ImageStyleSchema = z.object({
    width: z.coerce.number().optional(),
    widthUnit: z.enum(['px', '%', 'vw', 'auto']).optional(),
    height: z.coerce.number().optional(),
    objectFit: z.enum(['cover', 'contain']).optional(),
});
/** Block base + variants ****************************************************/
const ContentBlockBaseSchema = z.object({
    id: z.string(),
    type: BlockTypeSchema,
    layout: GridPlacementSchema,
    fontSize: z.coerce.number().nullable().optional(),
    hAlign: AlignTypeSchema,
    vAlign: AlignTypeSchema,
    responsive: ResponsiveOverridesSchema.optional(),
});
export const TitleBlockSchema = ContentBlockBaseSchema.extend({
    type: z.literal('title'),
    text: z.string(),
});
export const BylineBlockSchema = ContentBlockBaseSchema.extend({
    type: z.literal('byline'),
    author: z.string(),
    publishedAt: z.string().optional(),
});
export const TextBlockSchema = ContentBlockBaseSchema.extend({
    type: z.literal('text'),
    text: z.string(),
});
export const ImageBlockSchema = ContentBlockBaseSchema.extend({
    type: z.literal('image'),
    src: z.string(),
    alt: z.string().optional(),
    mediaHandle: z.string().nullable().optional(),
    imageStyle: ImageStyleSchema.optional(),
});
export const AnyBlockSchema = z.discriminatedUnion('type', [
    TitleBlockSchema,
    BylineBlockSchema,
    TextBlockSchema,
    ImageBlockSchema,
]);
export const BlockUpdateSchema = z.object({
    layout: GridPlacementSchema.optional(),
    text: z.string().optional(),
    src: z.string().optional(),
    alt: z.string().optional(),
    mediaHandle: z.string().nullable().optional(),
    imageStyle: ImageStyleSchema.optional(),
    author: z.string().optional(),
    format: z.string().optional(),
    publishedAt: z.string().optional(),
    fontSize: z.coerce.number().nullable().optional(),
    hAlign: AlignTypeSchema.optional(),
    vAlign: AlignTypeSchema.optional(),
    responsive: ResponsiveOverridesSchema.nullable().optional(),
});
/** Page + ancillary models **************************************************/
export const PageContentResponseSchema = z.object({
    id: z.string(), // Stable document identifier (UUID or slug)
    slug: z.string(), // Public-facing slug used by the blog route
    title: z.string(), // Page/browser title
    status: PageStatusSchema, // Drives visibility in the public renderer
    updatedAt: z.string(), // ISO timestamp for cache invalidation
    blocks: z.array(AnyBlockSchema), // Ordered by layout.row/colStart
});
export const DirectoryMetaSchema = z.object({
    directory: z.string().nullable(),
    itemCount: z.number().int(),
    lastUploaded: z.string().nullable(),
});
// Page authoring payload (shared front/back)
export const PageMetaSchema = z.record(z.string(), z.unknown()).catch({});
export const PageWriteSchema = z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    status: PageStatusSchema.optional(),
    blocks: z.array(AnyBlockSchema).nonempty('At least one block is required'),
    meta: PageMetaSchema.optional(),
    publishedAt: z.string().nullable().optional(),
});
// Page payload returned by the API (authoring + meta)
export const PageWithMetaSchema = PageContentResponseSchema.extend({
    meta: PageMetaSchema.optional(),
    publishedAt: z.string().nullable().optional(),
});
