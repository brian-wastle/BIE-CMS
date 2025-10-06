// imagebox.component.ts
import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';
import { BlockShellTemplateComponent } from '../block-shell/block-shell-template.component';
import { PasteUrlDirective } from '../../directives/paste-url/paste-url.directive';
import { BLOCK_SHELL } from '../block-shell/block-shell';

@Component({
  selector: 'app-imagebox',
  standalone: true,
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => ImageBoxComponent) }],
  imports: [CommonModule, FormsModule, BlockShellTemplateComponent, PasteUrlDirective],
  templateUrl: './imagebox.component.html',
  styleUrls: ['./imagebox.component.scss'],
})
export class ImageBoxComponent extends BlockShell<ImageBlock> {
  broken = false;

  onSrcChange(v: string) { this.broken = false; this.emitUpdate({ src: v }); }
  onAltChange(v: string) { this.emitUpdate({ alt: v }); }
}
