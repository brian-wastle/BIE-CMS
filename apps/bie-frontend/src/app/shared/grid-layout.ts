export const BLOCK_VERTICAL_PADDING = 16;

export function rowsForContentHeight(contentHeight: number, rowHeightPx: number, gapPx: number): number {
  if (!Number.isFinite(contentHeight) || contentHeight <= 0) {
    return 1;
  }
  const rowHeight = Math.max(1, rowHeightPx);
  const rowGap = Math.max(0, gapPx);
  const paddedHeight = Math.max(0, contentHeight + BLOCK_VERTICAL_PADDING);
  return Math.max(1, Math.ceil((paddedHeight + rowGap) / (rowHeight + rowGap)));
}
 