export const GRID_COLUMNS = 3 as const;

export const tileWidth = {
    wide: 3,
    medium: 2,
    narrow: 1,
} as const;

export type Variant = keyof typeof tileWidth;
export type RowIndex = number;
export type ColIndex = number;

export interface Coords {
    tileX: ColIndex; // Column indexes 0-2
    tileY: RowIndex; // Row indexes 0+
}

export interface Heading extends Coords {
    type: 'heading';
    variant: 'postTitle' | 'subTitle';
    text: string;
}

export interface Divider extends Coords {
    type: 'divider';
    height?: number;
}

export interface Paragraph extends Coords {
    type: 'paragraph';
    variant?: Variant;
    align?: 'left' | 'center' | 'right';
    html: string;
}

export interface ImageWidget extends Coords {
    type: 'image';
    variant?: Variant;
    src: string;
    alt: string;
    aspectRatio?: `${number}/${number}`;
}

export interface VideoWidget extends Coords {
    type: 'video';
    variant?: Variant;
    src: string;
    poster?: string;
    aspectRatio?: `${number}/${number}`;
}

export interface Textbox extends Coords {
    type: 'textbox';
    variant?: Exclude<Variant, 'wide'>;   // Only allows medium or narrow textboxes
    html: string;
    image?: string;
}


export type Widget =
    Heading |
    Divider |
    Paragraph |
    ImageWidget |
    VideoWidget |
    Textbox;
