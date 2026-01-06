import { z } from 'zod';
/////////////////////////// Enums
export const BlockTypeSchema = z.enum(['text', 'image', 'video', 'title', 'byline', 'background', 'divider']);
export const AlignTypeSchema = z.enum(['flex-start', 'center', 'flex-end']);
export const ViewModeSchema = z.enum(['list', 'grid']);
export const BGStyleSchema = z.enum(['stretch', 'tile']);
/////////////////////////// Layout
export const GridPlacementSchema = z.object({
    row: z.coerce.number().int().nonnegative(), // Starting row
    colStart: z.coerce.number().int().nonnegative(), // Starting column
    colSpan: z.coerce.number().int().positive(), // Width in columns
    rowSpan: z.coerce.number().int().positive().optional(), // Height in rows
});
export const ImageStyleSchema = z
    .object({
    columns: z.coerce.number().int().min(1).max(12).optional(),
})
    .strict();
/////////////////////////// Block base and component schemas
// Each type is inferred from the respective zod schema
// Each new type must be added to the BlockSchemas const
const BlockBaseSchema = z.object({
    id: z.string(),
    type: BlockTypeSchema,
    layout: GridPlacementSchema,
    fontSize: z.coerce.number().nullable().optional(),
    color: z.string().optional(),
    hAlign: AlignTypeSchema,
    vAlign: AlignTypeSchema,
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
/////////////////////////// Block updates
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
export const BlockUpdateSchema = z.object(BlockUpdateShape);
/////////////////////////// Page models
export const DirectoryMetaSchema = z.object({
    directory: z.string().nullable(),
    itemCount: z.number().int(),
    lastUploaded: z.string().nullable(),
});
const JsonLdSchema = z.union([
    z.string().trim(),
    z.record(z.string(), z.unknown()),
    z.array(z.record(z.string(), z.unknown())),
]);
const KeywordsSchema = z
    .preprocess((value) => {
    if (typeof value === 'string') {
        return value
            .split(',')
            .map((keyword) => keyword.trim())
            .filter(Boolean);
    }
    return value;
}, z.array(z.string().trim().min(1).max(40)).max(12))
    .optional();
export const PageMetaSchema = z
    .object({
    seoTitle: z.string().trim().min(1).max(70).optional(),
    description: z.string().trim().min(1).max(160).optional(),
    keywords: KeywordsSchema,
    canonicalUrl: z.string().trim().url().optional(),
    robots: z.string().trim().max(120).optional(),
    author: z.string().trim().max(80).optional(),
    ogTitle: z.string().trim().min(1).max(70).optional(),
    ogDescription: z.string().trim().min(1).max(200).optional(),
    ogUrl: z.string().trim().url().optional(),
    ogType: z.enum(['website', 'article', 'profile']).optional(),
    twitterCard: z.enum(['summary', 'summary_large_image']).optional(),
    twitterTitle: z.string().trim().min(1).max(70).optional(),
    twitterDescription: z.string().trim().min(1).max(200).optional(),
    jsonLd: JsonLdSchema.optional(),
})
    .strip()
    .catch({});
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
