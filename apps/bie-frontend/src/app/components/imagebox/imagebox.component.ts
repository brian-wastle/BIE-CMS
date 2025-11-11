// imagebox.component.ts
import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';
import { BlockShellTemplateComponent } from '../block-shell/block-shell-template.component';
import { BLOCK_SHELL } from '../block-shell/block-shell';

@Component({
  selector: 'app-imagebox',
  standalone: true,
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => ImageBoxComponent) }],
  imports: [CommonModule, BlockShellTemplateComponent],
  templateUrl: './imagebox.component.html',
  styleUrls: ['./imagebox.component.scss'],
})
export class ImageBoxComponent extends BlockShell<ImageBlock> {
  broken = false;

  onImageError() {
    this.broken = true;
  }

  onImageLoad() {
    this.broken = false;
  }
}
