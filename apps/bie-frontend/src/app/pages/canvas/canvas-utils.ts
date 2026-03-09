import { AnyBlock, GridPlacement, InlineImage, InlineImageSize, InlinePlacement } from 'bie-models';

type InlineImageOptions = {
  maxInlineImages: number;
  placements: readonly InlinePlacement[];
  sizes: readonly InlineImageSize[];
};

// Clean up titles for use in urls
export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Trims keywords and empty strings, removes duplicates and checks each for validity against regex (alphanumeric chars, whitespace or hyphens, 1-39 char length)
export function validateKeywords(raw: string | null | undefined): { values: string[]; invalid: string[] } {
  if (!raw) {
    return { values: [], invalid: [] };
  }
  const pattern = /^[A-Za-z0-9][A-Za-z0-9\s-]{0,38}$/;
  const seen = new Set<string>();
  const values: string[] = [];
  const invalid: string[] = [];
  raw
    .split(',')
    .map(entry => entry.trim())
    .filter(s => s.length > 0)
    .forEach(keyword => {
      if (!pattern.test(keyword)) {
        invalid.push(keyword);
        return;
      }
      const normalized = keyword.toLowerCase();
      if (seen.has(normalized)) {
        return;
      }
      seen.add(normalized);
      values.push(keyword);
    });
  return { values, invalid };
}

// Walk an array of inputs and convert to strings
export function stringifyKeywords(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(s => s.length > 0)
      .join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }
  return '';
}

//Removes non-breaking spaces from Quill string
export function normalizeEditorHtml(value: string | null | undefined) {
  const trimmed = (value ?? '').trim();
  const normalized = trimmed.replace(/\u00a0/g, ' ').replace(/&(nbsp|#160|#x0*a0);/gi, ' ');
  if (!normalized || normalized === '<p><br></p>') {
    return '';
  }
  return normalized;
}

// Creates inline image object
export function normalizeInlineImages(input: InlineImage[] | null | undefined, options: InlineImageOptions): InlineImage[] {
  if (!Array.isArray(input)) {
    return [];
  }
  const { maxInlineImages, placements, sizes } = options;
  return input
    .slice(0, maxInlineImages)
    .map((image, index) => {
      const placement = parseInlinePlacement(image.placement, placements);
      const size = parseInlineImageSize(image.size, sizes);
      const id = (image.id ?? '').trim() || `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`;
      return {
        id,
        placement,
        size,
        src: (image.src ?? '').trim(),
        alt: image.alt ?? '',
        caption: image.caption ?? '',
        mediaHandle: image.mediaHandle ?? null,
      };
    });
}

// Creates inline placement object
export function parseInlinePlacement(
  raw: string | InlinePlacement | null | undefined,
  placements: readonly InlinePlacement[],
): InlinePlacement {
  const currentString = (raw ?? '').toString() as InlinePlacement;
  if (placements.includes(currentString)) {
    return currentString;
  }
  return placements[0] ?? 'top-left';
}

// Creates inline image size object
export function parseInlineImageSize(
  raw: string | InlineImageSize | null | undefined,
  sizes: readonly InlineImageSize[],
): InlineImageSize {
  const currentString = (raw ?? '').toString() as InlineImageSize;
  if (sizes.includes(currentString)) {
    return currentString;
  }
  return sizes[0] ?? 'medium';
}

// Clamps any canvas block within the boundaries of user's grid layout
export function clampLayout(desired: GridPlacement, totalColumns: number): GridPlacement {
  const totalCols = Math.max(1, totalColumns);
  const row = Math.max(1, desired?.row ?? 1);
  const colSpan = Math.max(1, Math.min(desired?.colSpan ?? totalCols, totalCols));
  const maxStart = totalCols - colSpan + 1;
  const colStart = Math.max(1, Math.min(desired?.colStart ?? 1, maxStart));
  const rowSpan = Math.max(1, desired?.rowSpan ?? 1);
  const rowGap = Math.max(0, desired?.rowGap ?? 0);
  return { row, colStart, colSpan, rowSpan, rowGap };
}

// Reduce on blocks to find the next empty row
export function nextRow(blocks: AnyBlock[]) {
  const lastRow = blocks.reduce((max, block) => {
    const layout = block.layout;
    if (!layout) {
      return max;
    }
    const span = Math.max(1, layout.rowSpan ?? 1);
    const rowEnd = (layout.row ?? 0) + span - 1;
    return Math.max(max, rowEnd);
  }, 0);
  return lastRow + 1;
}

// Cascade blocks down the page on reflow
export function reflowRows(blocks: AnyBlock[], columns: number) {
  if (!blocks.length) {
    return { blocks, changed: false };
  }
  let cursor = 1;
  let changed = false;
  const nextBlocks = blocks.map(block => {
    const layout = clampLayout(block.layout ?? { row: cursor, colStart: 1, colSpan: columns, rowSpan: 1 }, columns);
    const rowGap = Math.max(0, layout.rowGap ?? 0);
    const rowSpan = Math.max(1, layout.rowSpan ?? 1);
    const row = Math.max(1, cursor + rowGap);
    cursor = row + rowSpan;
    const prevLayout = block.layout ?? layout;
    const nextLayout = { ...layout, row, rowSpan, rowGap };
    if (
      prevLayout.row === nextLayout.row &&
      prevLayout.rowSpan === nextLayout.rowSpan &&
      (prevLayout.rowGap ?? 0) === nextLayout.rowGap &&
      prevLayout.colStart === nextLayout.colStart &&
      prevLayout.colSpan === nextLayout.colSpan
    ) {
      return block;
    }
    changed = true;
    return {
      ...block,
      layout: nextLayout,
    };
  });
  return { blocks: nextBlocks, changed };
}

// Sets a cursor at the start of blocks, walks array and finds next available position to insert
export function findInsertPoint(blocks: AnyBlock[], targetRow: number, columns: number) {
  const desiredRow = Math.max(1, Math.floor(targetRow));
  let cursor = 1;
  let rowTarget = desiredRow;
  for (let i = 0; i < blocks.length; i++) {
    const layout =
      blocks[i].layout ?? { row: cursor, colStart: 1, colSpan: columns, rowSpan: 1, rowGap: 0 };
    const gap = Math.max(0, layout.rowGap ?? 0);
    const start = cursor + gap;
    if (rowTarget <= start) {
      return {
        index: i,
        gap: Math.max(0, rowTarget - cursor),
      };
    }
    const span = Math.max(1, layout.rowSpan ?? 1);
    cursor = start + span;
    if (rowTarget < cursor) {
      rowTarget = cursor;
    }
  }
  return {
    index: blocks.length,
    gap: Math.max(0, rowTarget - cursor),
  };
}

// Used to sort blocks in the correct order by row, falls back to comparing by ID
export function compareByLayout(a: AnyBlock, b: AnyBlock) {
  const rowDiff = (a.layout?.row ?? 0) - (b.layout?.row ?? 0);
  if (rowDiff !== 0) {
    return rowDiff;
  }
  const colDiff = (a.layout?.colStart ?? 1) - (b.layout?.colStart ?? 1);
  if (colDiff !== 0) {
    return colDiff;
  }
  return a.id.localeCompare(b.id);
}
