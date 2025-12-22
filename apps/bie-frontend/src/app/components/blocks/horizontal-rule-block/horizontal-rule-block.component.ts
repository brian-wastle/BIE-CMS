import { Component } from '@angular/core';

import { DividerBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';

@Component({
  selector: 'app-horizontal-rule-block',
  imports: [],
  templateUrl: './horizontal-rule-block.component.html',
  styleUrls: ['./horizontal-rule-block.component.scss'],
})
export class HorizontalRuleBlockComponent extends BlockShell<DividerBlock> { }
