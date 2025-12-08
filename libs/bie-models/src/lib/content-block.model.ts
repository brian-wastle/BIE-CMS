import { z } from 'zod';

// Enums
export const BlockTypeSchema = z.enum(['text', 'image', 'video', 'title', 'byline', 'background', 'divider']);
export type BlockType = z.infer<typeof BlockTypeSchema>;

export const AlignTypeSchema = z.enum(['flex-start', 'center', 'flex-end']);
export type AlignType = z.infer<typeof AlignTypeSchema>;

export const BreakpointIdSchema = z.enum(['mobile', 'tablet', 'desktop']);
export type BreakpointId = z.infer<typeof BreakpointIdSchema>;

export const ViewModeSchema = z.enum(['list', 'grid']);
export type ViewMode = z.infer<typeof ViewModeSchema>;

export const BGStyleSchema = z.enum(['stretch', 'tile']);
export type BGStyle = z.infer<typeof BGStyleSchema>;

// Layout
export const GridPlacementSchema = z.object({
  row: z.coerce.number().int().nonnegative(), // Starting row
  colStart: z.coerce.number().int().nonnegative(), // Starting column
  colSpan: z.coerce.number().int().positive(), // Width in columns
  rowSpan: z.coerce.number().int().positive().optional(), // Height in rows
});
export type GridPlacement = z.infer<typeof GridPlacementSchema>;

export const OverrideSchema = z.object({
  fontSize: z.coerce.number().nullable().optional(),
  layout: GridPlacementSchema.partial().optional(),
  hAlign: AlignTypeSchema.optional(),
  vAlign: AlignTypeSchema.optional(),
});
export type ResponsiveOverride = z.infer<typeof OverrideSchema>;

export const ResponsiveOverridesSchema = z
  .object({
    mobile: OverrideSchema.optional(),
    tablet: OverrideSchema.optional(),
    desktop: OverrideSchema.optional(),
  })
  .partial();
export type ResponsiveOverrides = z.infer<typeof ResponsiveOverridesSchema>;

export const ImageStyleSchema = z
  .object({
    columns: z.coerce.number().int().min(1).max(12).optional(),
  })
  .strict();
export type ImageStyle = z.infer<typeof ImageStyleSchema>;


// Block base and component schemas
const ContentBlockBaseSchema = z.object({
  id: z.string(),
  type: BlockTypeSchema,
  layout: GridPlacementSchema,
  fontSize: z.coerce.number().nullable().optional(),
  color: z.string().optional(),
  hAlign: AlignTypeSchema,
  vAlign: AlignTypeSchema,
  responsive: ResponsiveOverridesSchema.optional(),
});

export const TitleBlockSchema = ContentBlockBaseSchema.extend({
  type: z.literal('title'),
  text: z.string(),
});
export type TitleBlock = z.infer<typeof TitleBlockSchema>;

export const BylineBlockSchema = ContentBlockBaseSchema.extend({
  type: z.literal('byline'),
  author: z.string(),
  publishedAt: z.string().optional(),
});
export type BylineBlock = z.infer<typeof BylineBlockSchema>;

export const TextBlockSchema = ContentBlockBaseSchema.extend({
  type: z.literal('text'),
  text: z.string(), 
});
export type TextBlock = z.infer<typeof TextBlockSchema>;

export const ImageBlockSchema = ContentBlockBaseSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string().optional(),
  mediaHandle: z.string().nullable().optional(),
  imageStyle: ImageStyleSchema.optional(),
});
export type ImageBlock = z.infer<typeof ImageBlockSchema>;

export const BGBlockSchema = ContentBlockBaseSchema.extend({
  type: z.literal('background'),
  src: z.string().optional(),
  mediaHandle: z.string().nullable().optional(),
  bgStyle: BGStyleSchema.default('stretch'),
});
export type BGBlock = z.infer<typeof BGBlockSchema>;

export const DividerBlockSchema = ContentBlockBaseSchema.extend({
  type: z.literal('divider'),
});
export type DividerBlock = z.infer<typeof DividerBlockSchema>;

export const AnyBlockSchema = z.discriminatedUnion('type', [
  TitleBlockSchema,
  BylineBlockSchema,
  TextBlockSchema,
  ImageBlockSchema,
  BGBlockSchema,
  DividerBlockSchema,
]);
export type AnyBlock = z.infer<typeof AnyBlockSchema>; // Used during component creation/editing

export const BlockUpdateSchema = z.object({
  layout: GridPlacementSchema.optional(),
  text: z.string().optional(),
  src: z.string().optional(),
  alt: z.string().optional(),
  mediaHandle: z.string().nullable().optional(),
  imageStyle: ImageStyleSchema.optional(),
  color: z.string().optional(),
  bgStyle: BGStyleSchema.optional(),
  author: z.string().optional(),
  format: z.string().optional(),
  publishedAt: z.string().optional(),
  fontSize: z.coerce.number().nullable().optional(),
  hAlign: AlignTypeSchema.optional(),
  vAlign: AlignTypeSchema.optional(),
  responsive: ResponsiveOverridesSchema.nullable().optional(),
});
export type BlockUpdate = z.infer<typeof BlockUpdateSchema>;

// Page models
export const DirectoryMetaSchema = z.object({
  directory: z.string().nullable(),
  itemCount: z.number().int(),
  lastUploaded: z.string().nullable(),
});
export type DirectoryMeta = z.infer<typeof DirectoryMetaSchema>;

export const PageMetaSchema = z.record(z.string(), z.unknown()).catch({});
export type PageMeta = z.infer<typeof PageMetaSchema>;

export const PageStatusSchema = z.enum(['draft', 'published']);
export type PageStatus = z.infer<typeof PageStatusSchema>;

export const PageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  status: PageStatusSchema,
  title: z.string(),
  blocks: z.array(AnyBlockSchema),
  meta: PageMetaSchema.optional(),
  createdBy: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable().optional(),
});
export type Page = z.infer<typeof PageSchema>;

const PagePatchSchema = z.object({
  title: z.string().min(1),
  status: PageStatusSchema.optional(),
  blocks: z.array(AnyBlockSchema).nonempty('At least one block is required'),
  meta: PageMetaSchema.optional(),
  publishedAt: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
});

export const PageWriteSchema = PagePatchSchema.extend({
  slug: z.string().min(1),
});
export type PageWrite = z.infer<typeof PageWriteSchema>;

export const PageUpdateSchema = PagePatchSchema.extend({
  slug: z.string().min(1).optional(),
});
export type PageUpdate = z.infer<typeof PageUpdateSchema>;

export const PageSummarySchema = z.object({
  page: PageSchema,
});
export type PageSummary = z.infer<typeof PageSummarySchema>;

export const PageDetailSchema = z.object({
  page: PageSchema,
});
export type PageDetail = z.infer<typeof PageDetailSchema>;

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
export type PageContentResponse = z.infer<typeof PageContentResponseSchema>;

export const PageWithMetaSchema = PageContentResponseSchema;
export type PageWithMeta = z.infer<typeof PageWithMetaSchema>;
