import { z } from 'zod';

/////////////////////////// Enums

export const BlockTypeSchema = z.enum([
  'text',
  'image',
  'video',
  'title',
  'byline',
  'background',
  'divider',
  'InlineText',
]);

export const AlignTypeSchema = z.enum(['flex-start', 'center', 'flex-end']);
export type AlignType = z.infer<typeof AlignTypeSchema>;

export const ViewModeSchema = z.enum(['list', 'grid']);
export type ViewMode = z.infer<typeof ViewModeSchema>;

export const BGStyleSchema = z.enum(['stretch', 'tile']);
export type BGStyle = z.infer<typeof BGStyleSchema>;

/////////////////////////// Layout

export const GridSettingsDefaults = {
  columns: 12,
  gapPx: 16,
  rowHeight: 48,
  maxWidthPx: 1200,
} as const;

export const GridSettingsSchema = z
  .object({
    columns: z.coerce.number().int().min(1).max(24).default(GridSettingsDefaults.columns),
    gapPx: z.coerce.number().int().min(0).max(64).default(GridSettingsDefaults.gapPx),
    rowHeight: z.coerce.number().int().min(8).max(256).default(GridSettingsDefaults.rowHeight),
    maxWidthPx: z.coerce.number().int().min(0).max(4096).default(GridSettingsDefaults.maxWidthPx),
  })
  .strip()
  .catch(GridSettingsDefaults);
export type GridSettings = z.infer<typeof GridSettingsSchema>;

export const GridPlacementSchema = z.object({
  row: z.coerce.number().int().nonnegative(),
  colStart: z.coerce.number().int().nonnegative(),
  colSpan: z.coerce.number().int().positive(),
  rowSpan: z.coerce.number().int().positive().optional(),
});
export type GridPlacement = z.infer<typeof GridPlacementSchema>;

export const ImageStyleSchema = z
  .object({
    columns: z.coerce.number().int().min(1).max(12).optional(),
  })
  .strict();
export type ImageStyle = z.infer<typeof ImageStyleSchema>;

export const InlinePlacementSchema = z.enum(['top-left', 'top-right']);
export type InlinePlacement = z.infer<typeof InlinePlacementSchema>;

export const InlineImageSizeSchema = z.enum(['small', 'medium', 'large']);
export type InlineImageSize = z.infer<typeof InlineImageSizeSchema>;

/////////////////////////// Block base and component schemas
// Each type is inferred from the respective zod schema
// Each new type must be added to the BlockTypeSchema const at top of file

// Abstract zod object with shared block properties
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
export type TitleBlock = z.infer<typeof TitleBlockSchema>;

export const BylineBlockSchema = BlockBaseSchema.extend({
  type: z.literal('byline'),
  author: z.string(),
  publishedAt: z.string().optional(),
});
export type BylineBlock = z.infer<typeof BylineBlockSchema>;

export const TextBlockSchema = BlockBaseSchema.extend({
  type: z.literal('text'),
  text: z.string(), 
});
export type TextBlock = z.infer<typeof TextBlockSchema>;

export const InlineImageSchema = z
  .object({
    id: z.string(),
    src: z.string(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    placement: InlinePlacementSchema.default('top-left'),
    size: InlineImageSizeSchema.default('medium'),
    mediaHandle: z.string().nullable().optional(),
  })
  .strip();
export type InlineImage = z.infer<typeof InlineImageSchema>;

export const InlineTextBlockSchema = BlockBaseSchema.extend({
  type: z.literal('InlineText'),
  text: z.string(),
  images: z.array(InlineImageSchema).max(4),
});
export type InlineTextBlock = z.infer<typeof InlineTextBlockSchema>;

export const ImageBlockSchema = BlockBaseSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string().optional(),
  mediaHandle: z.string().nullable().optional(),
  imageStyle: ImageStyleSchema.optional(),
});
export type ImageBlock = z.infer<typeof ImageBlockSchema>;

export const VideoBlockSchema = BlockBaseSchema.extend({
  type: z.literal('video'),
  videoId: z.string(),
  videoUrl: z.string().optional(),
  caption: z.string().nullish(),
});
export type VideoBlock = z.infer<typeof VideoBlockSchema>;

export const BGBlockSchema = BlockBaseSchema.extend({
  type: z.literal('background'),
  src: z.string().optional(),
  mediaHandle: z.string().nullable().optional(),
  bgStyle: BGStyleSchema.default('stretch'),
});
export type BGBlock = z.infer<typeof BGBlockSchema>;

export const DividerBlockSchema = BlockBaseSchema.extend({
  type: z.literal('divider'),
});
export type DividerBlock = z.infer<typeof DividerBlockSchema>;

const BlockSchemas = [
  TitleBlockSchema,
  BylineBlockSchema,
  TextBlockSchema,
  InlineTextBlockSchema,
  VideoBlockSchema,
  ImageBlockSchema,
  BGBlockSchema,
  DividerBlockSchema,
] as const;

export const AnyBlockSchema = z.discriminatedUnion('type', BlockSchemas);
export type AnyBlock = z.infer<typeof AnyBlockSchema>; // Used during component creation/editing

/////////////////////////// Block updates

// Distributive conditional type to create a union/partial of all patchable props from all block types
// Reduce on BlockSchemas type array, loops through each Zod object to create the partial skipping id and type props
// Returns shape, which is a flattened record: {text: z.string().optional(), src: z.string().optional(), ... }
const BlockUpdateShape = BlockSchemas.reduce<Record<string, z.ZodTypeAny>>((shape, blockSchema) => {
  const partialShape = blockSchema.partial().shape as Record<string, z.ZodTypeAny>;
  Object.entries(partialShape).forEach(([key, value]) => {
    if (key === 'id' || key === 'type') {
      return;
    }
    shape[key] = value;
  });
  return shape;
}, {});
export const BlockUpdateSchema = z.object(BlockUpdateShape);

// Wrapping each value as a function enables distributive behavior in the conditional
// Function parameter types are contravariant in TS: a union of functions yields the intersection of the param types [Cherny 144]
type UnionToIntersection<U> =
(U extends unknown ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;

// Create a partial with all properties as optional
// (typeof BlockSchemas)[number] - 'number' keys into any index of the array [Cherny 134]
type BlockPatchUnion = (typeof BlockSchemas)[number] extends infer Schema
  ? Schema extends z.ZodTypeAny
    ? Partial<Omit<z.infer<Schema>, 'id' | 'type'>>
    : never
  : never;
type BlockUpdateProps = UnionToIntersection<BlockPatchUnion>;

// {t?:string} & {u?:string} --> {t?:string; url?:string}
type Simplify<T> = { [K in keyof T]: T[K] };

export type BlockUpdate = Simplify<z.infer<typeof BlockUpdateSchema> & BlockUpdateProps>;

/////////////////////////// Page models

// Interface for media directories created by media upload page
export const DirectoryMetaSchema = z.object({
  directory: z.string().nullable(),
  itemCount: z.number().int(),
  lastUploaded: z.string().nullable(),
});
export type DirectoryMeta = z.infer<typeof DirectoryMetaSchema>;

// JSON-LD injected into page head
const JsonLdSchema = z.union([
  z.string().trim(),
  z.record(z.string(), z.unknown()),
  z.array(z.record(z.string(), z.unknown())),
]);

// Accepts an array of strings or will run preprocess function to split a string on commas and separate into an array of up to 12 strings, 1-40 chars each
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
export type PageMeta = z.infer<typeof PageMetaSchema>;

export const PageStatusSchema = z.enum(['draft', 'published']);
export type PageStatus = z.infer<typeof PageStatusSchema>;

// Published page data type
export const PageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  status: PageStatusSchema,
  title: z.string(),
  blocks: z.array(AnyBlockSchema),
  grid: GridSettingsSchema.default(GridSettingsDefaults),
  meta: PageMetaSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable().optional(),
});
export type Page = z.infer<typeof PageSchema>;

// Used for updating block schema in canvas editor
const PagePatchSchema = z.object({
  title: z.string().min(1),
  status: PageStatusSchema.optional(),
  blocks: z.array(AnyBlockSchema).nonempty('At least one block is required'),
  grid: GridSettingsSchema.default(GridSettingsDefaults),
  meta: PageMetaSchema.optional(),
  publishedAt: z.string().nullable().optional(),
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
