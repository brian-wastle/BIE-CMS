export type BlockType = 'text' | 'image' | 'video' | 'title' | 'byline';
export type AlignType = 'flex-start' | 'center' | 'flex-end';


export interface GridPlacement {
  row: number;         // Starting row
  colStart: number;    // Starting column
  colSpan: number;     // Width in columns
  rowSpan?: number;    // Height in rows
}
export interface ContentBlockBase {
  id: string;
  type: BlockType;
  layout: GridPlacement;
  fontSize?: number;
  hAlign: AlignType;
  vAlign: AlignType;
}

export interface BylineBlock extends ContentBlockBase {
  type: 'byline';
  author: string;           // Display name of the author
  publishedAt?: string;     // ISO timestamp filled in when the post publishes
}

export interface TitleBlock extends ContentBlockBase {
  type: 'title';
  text: string;
}

export interface TextBlock extends ContentBlockBase {
  type: 'text';
  text: string; // TODO: HTML string from Quill
}

export interface ImageBlock extends ContentBlockBase {
  type: 'image';
  src: string;
  alt?: string;
  mediaHandle?: string | null;
  imageStyle?: ImageStyle;
}

export type BlockUpdate = {
  layout?: GridPlacement;
  text?: string;
  src?: string;
  alt?: string;
  mediaHandle?: string | null;
  imageStyle?: ImageStyle;
  author?: string;
  format?: string;
  publishedAt?: string;
  fontSize?: number | null;
  hAlign?: AlignType;
  vAlign?: AlignType;
};

export type AnyBlock = TextBlock | ImageBlock | BylineBlock | TitleBlock;    // Used during component creation/editing

// Published page
export interface PageContentResponse {
  id: string;             // Stable document identifier (UUID or slug)
  slug: string;           // Public-facing slug used by the blog route
  title: string;          // Page/browser title
  status: 'draft' | 'published'; // Drives visibility in the public renderer
  updatedAt: string;      // ISO timestamp for cache invalidation
  version: number;        // Schema/content version
  blocks: AnyBlock[];     // Ordered by layout.row/colStart
}

// Used for tracking user's directories in media browser
export interface DirectoryMeta {
  directory: string | null;
  itemCount: number;
  lastUploaded: string | null;
}

// Media upload view modes
export type ViewMode = 'list' | 'grid';

export interface ImageStyle {
  width?: number;        
  widthUnit?: 'px' | '%' | 'vw' | 'auto';
  height?: number;
  objectFit?: 'cover' | 'contain';
}
