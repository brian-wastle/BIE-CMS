// imagebox.component.ts
import { Component } from '@angular/core';

import { ImageBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';

@Component({
  selector: 'app-imagebox',
  imports: [],
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
