// imagebox.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageBlock } from 'bie-models';
import { LayoutControlsComponent } from '../layout-controls/layout-controls.component';
import { AuthorScopeDirective } from '../../directives/author-scope/author-scope.directive';
import { PasteUrlDirective } from '../../directives/paste-url/paste-url.directive';
import { BlockShell } from '../block-shell/block-shell'; 

@Component({
  selector: 'app-imagebox',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutControlsComponent, AuthorScopeDirective, PasteUrlDirective],
  templateUrl: './imagebox.component.html',
  styleUrls: ['./imagebox.component.scss'],
})
export class ImageBoxComponent extends BlockShell<ImageBlock> {
  broken = false;

  onSrcChange(v: string) { this.broken = false; this.emitUpdate({ src: v }); }
  onAltChange(v: string) { this.emitUpdate({ alt: v }); }
}
