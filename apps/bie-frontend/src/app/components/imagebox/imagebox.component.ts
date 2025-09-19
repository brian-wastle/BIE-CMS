import { Component, ElementRef, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageBlock, BlockUpdate } from 'bie-models';
import { LayoutControlsComponent } from '../layout-controls/layout-controls.component';
import { CanvasEditStateService } from '../../services/canvas-edit-state/canvas-edit-state.service';
import { AuthorScopeDirective } from '../../directives/author-scope/author-scope.directive';
import { PasteUrlDirective } from '../../directives/paste-url/paste-url.directive';

@Component({
  selector: 'app-imagebox',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutControlsComponent, AuthorScopeDirective, PasteUrlDirective],
  templateUrl: './imagebox.component.html',
  styleUrls: ['./imagebox.component.scss'],
})
export class ImageBoxComponent {
  readonly block = input.required<ImageBlock>();
  readonly editable = input(true);
  readonly totalColumns = input(12);

  @Output() editingChange = new EventEmitter<boolean>();
  @Output() update = new EventEmitter<BlockUpdate>();

  broken = false;

  constructor(
    private host: ElementRef<HTMLElement>,
    private editState: CanvasEditStateService
  ) {}

  onSrcChange(v: string) { this.broken = false; this.update.emit({ src: v }); }
  onAltChange(v: string) { this.update.emit({ alt: v }); }
}
