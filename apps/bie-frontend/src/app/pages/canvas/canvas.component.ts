import { Component, TrackByFunction, computed, signal, HostListener, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDropList, CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { CurrentUserService } from '../../services/current-user/current-user.service';
import { AnyBlock, TextBlock, ImageBlock, BylineBlock, TitleBlock, BlockUpdate } from 'bie-models';
import { BlogTitleComponent } from '../../components/blog-title/blog-title.component';
import { BlogBylineComponent } from '../../components/blog-byline/blog-byline.component';
import { TextBoxComponent } from '../../components/textbox/textbox.component';
import { ImageBoxComponent } from '../../components/imagebox/imagebox.component';
@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CdkDrag,
    CdkDropList,
    DragDropModule,
    MatIconModule,
    TextBoxComponent,
    ImageBoxComponent,
    BlogTitleComponent,
    BlogBylineComponent,
  ],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent {
  authorMode = true;
  columns = 12;
  gapPx = 16;

  // Get current username as Author and generate initial byline block
  private readonly currentUserService = inject(CurrentUserService);
  readonly currentUser = this.currentUserService.user;
  private readonly currentAuthor = computed(() => {
    const user = this.currentUser();
    if (!user) { return 'Author'; }
    return user.username ? user.username.trim() :
      (user.firstName ? user.firstName : 'Admin');
  });


  constructor() {
    effect(() => {
      const author = this.currentAuthor();
      this.blocks.update(arr => {
        let changed = false;
        const next = arr.map(block => {
          if (this.isBylineBlock(block) && block.author !== author) {
            changed = true;
            return { ...block, author };
          }
          return block;
        });
        return changed ? next : arr;
      });
    });
  }

  // Initial editor state and selected block as Signals
  blocks = signal<AnyBlock[]>([
    { id: 't1', type: 'title', order: 0, layout: { colStart: 1, colSpan: 12 }, text: '' } as TitleBlock,
    { id: 'b1', type: 'byline', order: 1, layout: { colStart: 1, colSpan: 12 }, author: '', publishedAt: '' } as BylineBlock
  ]);
  pageBlocks = computed(() => [...this.blocks()].sort((a, b) => a.order - b.order));

  selectedId = signal<string | null>(null);
  selected = computed(() => this.blocks().find(b => b.id === this.selectedId()) ?? null);

  @HostListener('document:keydown.escape')
  onEsc() { this.clearSelection(); }

  // Help the canvas id which block types to render
  isTitleBlock(block: AnyBlock): block is TitleBlock { return block.type === 'title'; }
  isBylineBlock(block: AnyBlock): block is BylineBlock { return block.type === 'byline'; }
  isTextBlock(block: AnyBlock): block is TextBlock { return block.type === 'text'; }
  isImageBlock(block: AnyBlock): block is ImageBlock { return block.type === 'image'; }

  // Generate new Component

  addTitle() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => [...arr, { id, type: 'title', order: arr.length, layout: { colStart: 1, colSpan: 12 }, text:'' } as TitleBlock]);
    this.selectedId.set(id);
  }

  addByline() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => [...arr, { id, type: 'byline', order: arr.length, layout: { colStart: 1, colSpan: 12 }, author: this.currentAuthor() } as BylineBlock]);
    this.selectedId.set(id);
  }

  addText() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => [...arr, { id, type: 'text', order: arr.length, layout: { colStart: 1, colSpan: 6 }, text: '' } as TextBlock]);
    this.selectedId.set(id);
  }

  addImage() {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    this.blocks.update(arr => [...arr, { id, type: 'image', order: arr.length, layout: { colStart: 1, colSpan: 6 }, src: '', alt: '' } as ImageBlock]);
    this.selectedId.set(id);
  }

  // Remove a component
  remove(id: string) {
    this.blocks.update(arr => arr.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i })));
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  // Live preview styles
  gridStyle(block: AnyBlock) {
    const { colStart, colSpan } = block.layout ?? { colStart: 1, colSpan: 1 };
    return { 'grid-column': `${colStart} / span ${colSpan}` };
  }

  // Drag-and-drop components vertically
  onDrop(event: CdkDragDrop<AnyBlock[]>) {
    const sorted = this.pageBlocks().slice();
    moveItemInArray(sorted, event.previousIndex, event.currentIndex);
    const reindex = sorted.map((block, index) => ({ ...block, order: index }));
    const byId = new Map(reindex.map(block => [block.id, block]));
    this.blocks.update(arr => arr.map(b => byId.get(b.id)!));
  }

  // Set/clear focus
  select(blockId: string) { this.selectedId.set(blockId); }

  toggleSelect(blockId: string) {
    this.selectedId.set(this.selectedId() === blockId ? null : blockId);
  }

  clearSelection() {
    this.selectedId.set(null);
  }

  setColStart(block: AnyBlock, val: number) {
    const cols = this.columns;
    const colStart = Math.max(1, Math.min(val, cols));
    const maxSpan = cols - colStart + 1;
    this.blocks.update(arr => arr.map(b =>
      b.id === block.id ? { ...b, layout: { colStart, colSpan: Math.max(2, Math.min(b.layout.colSpan, maxSpan)) } } : b
    ));
  }

  setColSpan(block: AnyBlock, val: number) {
    const cols = this.columns;
    const maxSpan = cols - block.layout.colStart + 1;
    const colSpan = Math.max(2, Math.min(val, maxSpan));
    this.blocks.update(arr => arr.map(b =>
      b.id === block.id ? { ...b, layout: { ...b.layout, colSpan } } : b
    ));
  }

  onEditing(blockId: string, isEditing: boolean) {
    if (isEditing) {
      this.selectedId.set(blockId);
    } else if (this.selectedId() === blockId) {
      this.selectedId.set(null);
    }
  }

  onBlockUpdate(block: AnyBlock, patch: BlockUpdate) {
    this.blocks.update(arr => arr.map(b => {
      if (b.id !== block.id) return b;
      const base: AnyBlock = patch.layout ? { ...b, layout: { ...patch.layout } } : b;
      if (this.isTitleBlock(base)) {
        return ('text' in patch) ? { ...base, text: patch.text ?? '' } as TitleBlock : base;
      }
      if (this.isTextBlock(base)) {
        return ('text' in patch) ? { ...base, text: patch.text ?? '' } as TextBlock : base;
      }
      if (this.isImageBlock(base)) {
        return {
          ...base,
          ...('src' in patch ? { src: patch.src ?? '' } : {}),
          ...('alt' in patch ? { alt: patch.alt } : {}),
        } as ImageBlock;
      }
      if (this.isBylineBlock(base)) {
        return {
          ...base,
          ...('author' in patch ? { author: patch.author ?? base.author } : {}),
          ...('publishedAt' in patch ? { publishedAt: patch.publishedAt } : {}),
        } as BylineBlock;
      }
      return base;
    }));
  }

  trackByBlockId: TrackByFunction<AnyBlock> = (_i, block) => block.id;
}


