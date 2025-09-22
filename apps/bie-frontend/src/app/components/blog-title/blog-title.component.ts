import { Component, EventEmitter, Output, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleBlock, BlockUpdate } from 'bie-models';
import { LayoutControlsComponent } from '../layout-controls/layout-controls.component';
import { AuthorScopeDirective } from '../../directives/author-scope/author-scope.directive';

@Component({
  selector: 'app-title-block',
  standalone: true,
  imports: [CommonModule, LayoutControlsComponent, AuthorScopeDirective],
  templateUrl: './blog-title.component.html',
  styleUrls: ['./blog-title.component.scss']
})
export class BlogTitleComponent {
  readonly block = input.required<TitleBlock>();
  readonly editable = input(true);
  readonly totalColumns = input(12);

  readonly titleContent = computed(() => this.block().text ?? '');

  @Output() editingChange = new EventEmitter<boolean>();
  @Output() update = new EventEmitter<BlockUpdate>();

  onInput(value: string) {
    if (value !== this.block().text) {
      this.update.emit({ text: value });
    }
  }
}
