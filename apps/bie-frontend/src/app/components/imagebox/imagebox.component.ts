import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridPlacement, ImageBlock } from 'bie-models';
import { LayoutControlsComponent } from '../layout-controls/layout-controls.component';

type BlockUpdate = { layout?: GridPlacement; text?: string; src?: string; alt?: string };

@Component({
  selector: 'app-imagebox',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutControlsComponent],
  templateUrl: './imagebox.component.html',
  styleUrls: ['./imagebox.component.scss'],
})
export class ImageBoxComponent {
  @Input({ required: true }) block!: ImageBlock;
  @Input() editable = true;
  @Input() totalColumns = 12;

  @Output() editingChange = new EventEmitter<boolean>();
  @Output() update = new EventEmitter<BlockUpdate>();

  onFocus() { this.editingChange.emit(true); }
  onBlur()  { this.editingChange.emit(false); }

  onSrcChange(v: string) { this.update.emit({ src: v }); }
  onAltChange(v: string) { this.update.emit({ alt: v }); }
  onLayoutChange(layout: GridPlacement) { this.update.emit({ layout }); }
}
