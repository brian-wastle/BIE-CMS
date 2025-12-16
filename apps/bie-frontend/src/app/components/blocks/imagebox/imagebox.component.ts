// imagebox.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';

@Component({
  selector: 'app-imagebox',
  imports: [CommonModule],
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
