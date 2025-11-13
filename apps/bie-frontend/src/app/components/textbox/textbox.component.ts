// textbox.component.ts
import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBlock } from 'bie-models';
import { BlockShell, BLOCK_SHELL } from '../block-shell/block-shell';

@Component({
  selector: 'app-textbox',
  providers: [{ provide: BLOCK_SHELL, useExisting: forwardRef(() => TextBoxComponent) }],
  imports: [CommonModule],
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextBoxComponent extends BlockShell<TextBlock> {
}
