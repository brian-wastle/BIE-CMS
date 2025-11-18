// imagebox.component.ts
import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageBlock, ImageStyle } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';

@Component({
  selector: 'app-imagebox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imagebox.component.html',
  styleUrls: ['./imagebox.component.scss'],
})
export class ImageBoxComponent extends BlockShell<ImageBlock> {
  broken = false;
  readonly imageStyle = computed<ImageStyle>(() => this.block().imageStyle ?? { widthUnit: 'auto' });
  readonly resolvedWidth = computed(() => {
    const style = this.imageStyle();
    if (style.widthUnit === 'auto') {
      return 'auto';
    }
    const hasWidth = typeof style.width === 'number' && !Number.isNaN(style.width);
    if (!hasWidth) {
      return 'auto';
    }
    const unit = style.widthUnit ?? 'px';
    return `${style.width}${unit}`;
  });

  onImageError() {
    this.broken = true;
  }

  onImageLoad() {
    this.broken = false;
  }
}
