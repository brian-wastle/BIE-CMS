import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { ImageBlock } from 'bie-models';
import type { MediaItem } from '../../../services/media-library/media-library.service';
import { MediaBrowserCarouselComponent } from '../../media-browser-carousel/media-browser-carousel.component';

@Component({
  selector: 'app-imagebox-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatExpansionModule, MediaBrowserCarouselComponent],
  templateUrl: './imagebox-inspector.component.html',
  styleUrls: ['./imagebox-inspector.component.scss'],
})
export class ImageBoxInspectorComponent {
  readonly block = input.required<ImageBlock>();
  readonly patch = output<Partial<ImageBlock>>();

  readonly alt = computed(() => this.block().alt ?? '');
  readonly mediaHandle = computed(() => this.block().mediaHandle ?? null);
  readonly canClearImage = computed(() => Boolean((this.block().src ?? '').trim().length));

  onAltChange(raw: string | null | undefined) {
    const alt = (raw ?? '').toString();
    this.patch.emit({ alt });
  }

  clearImage() {
    if (!this.canClearImage()) {
      return;
    }
    this.patch.emit({ src: '', alt: '', mediaHandle: null });
  }

  onMediaSelected(item: MediaItem) {
    const cdn = item.cdnUrl?.trim() ?? '';
    const storage = item.storagePath?.trim() ?? '';
    const src = cdn || storage;
    if (!src) {
      return;
    }
    const patch: Partial<ImageBlock> = { src, mediaHandle: item.handle };
    if (!(this.block().alt ?? '').trim()) {
      patch.alt = this.buildAltSuggestion(item.filename);
    }
    this.patch.emit(patch);
  }

  private buildAltSuggestion(filename: string | null | undefined) {
    if (!filename) {
      return '';
    }
    return filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  }
}
