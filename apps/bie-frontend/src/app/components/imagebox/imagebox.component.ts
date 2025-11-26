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
  readonly imageStyle = computed<ImageStyle>(() => this.block().imageStyle ?? {});
  readonly resolvedImageStyles = computed(() => {
    const style = this.imageStyle();
    const mode = style.sizeMode ?? 'auto';
    const resolved: Record<string, string | null> = {
      width: null,
      height: 'auto',
      'max-width': '100%',
    };

    if (mode === 'fit-width') {
      resolved['width'] = '100%';
      return resolved;
    }

    if (mode === 'custom') {
      resolved['width'] = this.formatDimension(style.customWidth, style.customWidthUnit ?? 'px');
      resolved['height'] = this.formatDimension(style.customHeight, style.customHeightUnit ?? 'px') ?? 'auto';
      return resolved;
    }

    return resolved;
  });

  onImageError() {
    this.broken = true;
  }

  onImageLoad() {
    this.broken = false;
  }

  private formatDimension(value: number | undefined, unit: string) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      return null;
    }
    const normalizedUnit = unit || 'px';
    return `${value}${normalizedUnit}`;
  }
}
