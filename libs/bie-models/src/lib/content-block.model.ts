export type BlockType = 'text' | 'image' | 'video' | 'carousel';

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

export type BlockUpdate = {
  layout?: GridPlacement;
  text?: string;
  src?: string;
  alt?: string;
};

export type AnyBlock = TextBlock | ImageBlock;    // Used during component creation/editing