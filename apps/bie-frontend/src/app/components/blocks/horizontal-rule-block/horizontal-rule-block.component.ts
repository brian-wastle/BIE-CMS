import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';

@Component({
  selector: 'app-horizontal-rule-block',
  imports: [CommonModule],
  templateUrl: './horizontal-rule-block.component.html',
  styleUrls: ['./horizontal-rule-block.component.scss'],
})
export class HorizontalRuleBlockComponent extends BlockShell<DividerBlock> { }
