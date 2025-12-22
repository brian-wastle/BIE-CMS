import { z } from 'zod';
// Enums
export const BlockTypeSchema = z.enum(['text', 'image', 'video', 'title', 'byline', 'background', 'divider']);
export const AlignTypeSchema = z.enum(['flex-start', 'center', 'flex-end']);
export const BreakpointIdSchema = z.enum(['mobile', 'tablet', 'desktop']);
export const ViewModeSchema = z.enum(['list', 'grid']);
export const BGStyleSchema = z.enum(['stretch', 'tile']);
// Layout
export const GridPlacementSchema = z.object({
    row: z.coerce.number().int().nonnegative(), // Starting row
    colStart: z.coerce.number().int().nonnegative(), // Starting column
    colSpan: z.coerce.number().int().positive(), // Width in columns
    rowSpan: z.coerce.number().int().positive().optional(), // Height in rows
});
export const OverrideSchema = z.object({
    fontSize: z.coerce.number().nullable().optional(),
    layout: GridPlacementSchema.partial().optional(),
    hAlign: AlignTypeSchema.optional(),
    vAlign: AlignTypeSchema.optional(),
});
export const ResponsiveOverridesSchema = z
    .object({
    mobile: OverrideSchema.optional(),
    tablet: OverrideSchema.optional(),
    desktop: OverrideSchema.optional(),
})
    .partial();
export const ImageStyleSchema = z
    .object({
    columns: z.coerce.number().int().min(1).max(12).optional(),
})
    .strict();
// Block base and component schemas
const BlockBaseSchema = z.object({
    id: z.string(),
    type: BlockTypeSchema,
    layout: GridPlacementSchema,
    fontSize: z.coerce.number().nullable().optional(),
    color: z.string().optional(),
    hAlign: AlignTypeSchema,
    vAlign: AlignTypeSchema,
    responsive: ResponsiveOverridesSchema.optional(),
});
export const TitleBlockSchema = BlockBaseSchema.extend({
    type: z.literal('title'),
    text: z.string(),
});
export const BylineBlockSchema = BlockBaseSchema.extend({
    type: z.literal('byline'),
    author: z.string(),
    publishedAt: z.string().optional(),
});
export const TextBlockSchema = BlockBaseSchema.extend({
    type: z.literal('text'),
    text: z.string(),
});
export const ImageBlockSchema = BlockBaseSchema.extend({
    type: z.literal('image'),
    src: z.string(),
    alt: z.string().optional(),
    mediaHandle: z.string().nullable().optional(),
    imageStyle: ImageStyleSchema.optional(),
});
export const VideoBlockSchema = BlockBaseSchema.extend({
    type: z.literal('video'),
    videoId: z.string(),
    videoUrl: z.string().optional(),
    caption: z.string().nullish(),
});
export const BGBlockSchema = BlockBaseSchema.extend({
    type: z.literal('background'),
    src: z.string().optional(),
    mediaHandle: z.string().nullable().optional(),
    bgStyle: BGStyleSchema.default('stretch'),
});
export const DividerBlockSchema = BlockBaseSchema.extend({
    type: z.literal('divider'),
});
const BlockSchemas = [
    TitleBlockSchema,
    BylineBlockSchema,
    TextBlockSchema,
    VideoBlockSchema,
    ImageBlockSchema,
    BGBlockSchema,
    DividerBlockSchema,
];
export const AnyBlockSchema = z.discriminatedUnion('type', BlockSchemas);
const BlockUpdateShape = BlockSchemas.reduce((shape, blockSchema) => {
    const partialShape = blockSchema.partial().shape;
    Object.entries(partialShape).forEach(([key, value]) => {
        if (key === 'id' || key === 'type') {
            return;
        }
        shape[key] = value;
    });
    return shape;
}, {});
if (BlockUpdateShape.responsive) {
    BlockUpdateShape.responsive = ResponsiveOverridesSchema.nullable().optional();
}
export const BlockUpdateSchema = z.object(BlockUpdateShape);
// Page models
export const DirectoryMetaSchema = z.object({
    directory: z.string().nullable(),
    itemCount: z.number().int(),
    lastUploaded: z.string().nullable(),
});
export const PageMetaSchema = z.record(z.string(), z.unknown()).catch({});
export const PageStatusSchema = z.enum(['draft', 'published']);
export const PageSchema = z.object({
    id: z.string(),
    slug: z.string(),
    status: PageStatusSchema,
    title: z.string(),
    blocks: z.array(AnyBlockSchema),
    meta: PageMetaSchema.optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string().nullable().optional(),
});
const PagePatchSchema = z.object({
    title: z.string().min(1),
    status: PageStatusSchema.optional(),
    blocks: z.array(AnyBlockSchema).nonempty('At least one block is required'),
    meta: PageMetaSchema.optional(),
    publishedAt: z.string().nullable().optional(),
});
export const PageWriteSchema = PagePatchSchema.extend({
    slug: z.string().min(1),
});
export const PageUpdateSchema = PagePatchSchema.extend({
    slug: z.string().min(1).optional(),
});
export const PageSummarySchema = z.object({
    page: PageSchema,
});
export const PageDetailSchema = z.object({
    page: PageSchema,
});
export const PageContentResponseSchema = z.object({
    id: z.string(), // Page id
    slug: z.string(),
    title: z.string(),
    status: PageStatusSchema,
    updatedAt: z.string(),
    blocks: z.array(AnyBlockSchema),
    publishedAt: z.string().nullable().optional(),
    meta: PageMetaSchema.optional(),
});
export const PageWithMetaSchema = PageContentResponseSchema;
