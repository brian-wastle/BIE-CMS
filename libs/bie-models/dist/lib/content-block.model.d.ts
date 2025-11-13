export type BlockType = 'text' | 'image' | 'video' | 'title' | 'byline';
export type AlignType = 'flex-start' | 'center' | 'flex-end';
export interface GridPlacement {
    row: number;
    colStart: number;
    colSpan: number;
    rowSpan?: number;
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
    author: string;
    publishedAt?: string;
}
export interface TitleBlock extends ContentBlockBase {
    type: 'title';
    text: string;
}
export interface TextBlock extends ContentBlockBase {
    type: 'text';
    text: string;
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
export type AnyBlock = TextBlock | ImageBlock | BylineBlock | TitleBlock;
export interface PageContentResponse {
    id: string;
    slug: string;
    title: string;
    status: 'draft' | 'published';
    updatedAt: string;
    version: number;
    blocks: AnyBlock[];
}
export interface DirectoryMeta {
    directory: string | null;
    itemCount: number;
    lastUploaded: string | null;
}
export type ViewMode = 'list' | 'grid';
export interface ImageStyle {
    width?: number;
    widthUnit?: 'px' | '%' | 'vw' | 'auto';
    height?: number;
    objectFit?: 'cover' | 'contain';
}
//# sourceMappingURL=content-block.model.d.ts.map