import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { BGBlock } from 'bie-models';
import { BlockShell } from '../block-shell/block-shell';

@Component({
  selector: 'app-background-block',
  imports: [CommonModule],
  templateUrl: './background-block.component.html',
  styleUrls: ['./background-block.component.scss'],
})
export class BackgroundBlockComponent extends BlockShell<BGBlock> {
  readonly hasImage = computed(() => Boolean((this.block().src ?? '').trim()));

  readonly backgroundImageStyle = computed(() => {
    if (!this.hasImage()) {
      return null;
    }
    const src = this.block().src ?? '';
    const style = this.block().bgStyle ?? 'stretch';
    return {
      backgroundImage: `url('${src}')`,
      backgroundSize: style === 'tile' ? 'auto' : 'cover',
      backgroundRepeat: style === 'tile' ? 'repeat' : 'no-repeat',
      backgroundPosition: 'center',
    };
  });
}
