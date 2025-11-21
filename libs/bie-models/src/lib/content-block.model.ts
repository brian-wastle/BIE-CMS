import { z } from 'zod';

/** Common enums *************************************************************/
export const BlockTypeSchema = z.enum(['text', 'image', 'video', 'title', 'byline']);
export type BlockType = z.infer<typeof BlockTypeSchema>;

export const AlignTypeSchema = z.enum(['flex-start', 'center', 'flex-end']);
export type AlignType = z.infer<typeof AlignTypeSchema>;

export const BreakpointIdSchema = z.enum(['mobile', 'tablet', 'desktop']);
export type BreakpointId = z.infer<typeof BreakpointIdSchema>;

export const ViewModeSchema = z.enum(['list', 'grid']);
export type ViewMode = z.infer<typeof ViewModeSchema>;

/** Layout + responsive helpers **********************************************/
export const GridPlacementSchema = z.object({
  row: z.coerce.number().int().nonnegative(), // Starting row
  colStart: z.coerce.number().int().nonnegative(), // Starting column
  colSpan: z.coerce.number().int().positive(), // Width in columns
  rowSpan: z.coerce.number().int().positive().optional(), // Height in rows
});
export type GridPlacement = z.infer<typeof GridPlacementSchema>;

export const ResponsiveOverrideSchema = z.object({
  fontSize: z.coerce.number().nullable().optional(),
  layout: GridPlacementSchema.partial().optional(),
  hAlign: AlignTypeSchema.optional(),
  vAlign: AlignTypeSchema.optional(),
});
export type ResponsiveOverride = z.infer<typeof ResponsiveOverrideSchema>;

export const ResponsiveOverridesSchema = z
  .object({
    mobile: ResponsiveOverrideSchema.optional(),
    tablet: ResponsiveOverrideSchema.optional(),
    desktop: ResponsiveOverrideSchema.optional(),
  })
  .partial();
export type ResponsiveOverrides = z.infer<typeof ResponsiveOverridesSchema>;

export const ImageStyleSchema = z.object({
  width: z.coerce.number().optional(),
  widthUnit: z.enum(['px', '%', 'vw', 'auto']).optional(),
  height: z.coerce.number().optional(),
  objectFit: z.enum(['cover', 'contain']).optional(),
});
export type ImageStyle = z.infer<typeof ImageStyleSchema>;

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

export const AnyBlockSchema = z.discriminatedUnion('type', [
  TitleBlockSchema,
  BylineBlockSchema,
  TextBlockSchema,
  ImageBlockSchema,
]);
export type AnyBlock = z.infer<typeof AnyBlockSchema>; // Used during component creation/editing

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
export type BlockUpdate = z.infer<typeof BlockUpdateSchema>;

/** Page + ancillary models **************************************************/
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

export const PageVersionSummarySchema = z.object({
  id: z.string(),
  pageId: z.string(),
  version: z.coerce.number().int().positive(),
  status: PageStatusSchema,
  title: z.string(),
  createdBy: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable().optional(),
});
export type PageVersionSummary = z.infer<typeof PageVersionSummarySchema>;

export const PageVersionSchema = PageVersionSummarySchema.extend({
  blocks: z.array(AnyBlockSchema),
  meta: PageMetaSchema.optional(),
});
export type PageVersion = z.infer<typeof PageVersionSchema>;

export const PageIdentitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  latestVersionId: z.string().nullable().optional(),
  publishedVersionId: z.string().nullable().optional(),
});
export type PageIdentity = z.infer<typeof PageIdentitySchema>;

// Page authoring payloads (shared front/back)
export const PageWriteSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  status: PageStatusSchema.optional(),
  blocks: z.array(AnyBlockSchema).nonempty('At least one block is required'),
  meta: PageMetaSchema.optional(),
  publishedAt: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
});
export type PageWrite = z.infer<typeof PageWriteSchema>;

export const PageVersionWriteSchema = PageWriteSchema.omit({ slug: true });
export type PageVersionWrite = z.infer<typeof PageVersionWriteSchema>;

export const PageUpdateSchema = PageVersionWriteSchema.extend({
  slug: z.string().min(1).optional(),
});
export type PageUpdate = z.infer<typeof PageUpdateSchema>;

export const PageSummarySchema = z.object({
  page: PageIdentitySchema,
  latestVersion: PageVersionSummarySchema.nullable(),
  publishedVersion: PageVersionSummarySchema.nullable(),
});
export type PageSummary = z.infer<typeof PageSummarySchema>;

export const PageDetailSchema = z.object({
  page: PageIdentitySchema,
  draftVersion: PageVersionSchema.nullable(),
  publishedVersion: PageVersionSchema.nullable(),
  latestVersion: PageVersionSchema.nullable(),
  history: z.array(PageVersionSummarySchema),
});
export type PageDetail = z.infer<typeof PageDetailSchema>;

export const PageContentResponseSchema = z.object({
  id: z.string(), // Page id
  versionId: z.string(), // Version id used to render
  slug: z.string(),
  title: z.string(),
  status: PageStatusSchema,
  updatedAt: z.string(),
  blocks: z.array(AnyBlockSchema),
  publishedAt: z.string().nullable().optional(),
});
export type PageContentResponse = z.infer<typeof PageContentResponseSchema>;

// Page payload returned by the API (authoring + meta)
export const PageWithMetaSchema = PageContentResponseSchema.extend({
  meta: PageMetaSchema.optional(),
});
export type PageWithMeta = z.infer<typeof PageWithMetaSchema>;
