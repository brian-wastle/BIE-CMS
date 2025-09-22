import { Component, EventEmitter, Output, computed, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BylineBlock, BlockUpdate } from 'bie-models';
import { LayoutControlsComponent } from '../layout-controls/layout-controls.component';
import { AuthorScopeDirective } from '../../directives/author-scope/author-scope.directive';

const DISPLAY_FORMAT = 'MMMM d, y';

@Component({
  selector: 'app-byline-block',
  standalone: true,
  imports: [CommonModule, DatePipe, LayoutControlsComponent, AuthorScopeDirective],
  templateUrl: './blog-byline.component.html',
  styleUrls: ['./blog-byline.component.scss'],
})
export class BlogBylineComponent {
  readonly block = input.required<BylineBlock>();
  readonly editable = input(true);
  readonly totalColumns = input(12);

  @Output() editingChange = new EventEmitter<boolean>();
  @Output() update = new EventEmitter<BlockUpdate>();

  readonly displayFormat = DISPLAY_FORMAT;
  readonly authorName = computed(() => this.block().author ?? '');
  readonly displayDate = computed(() => {
    const publishedAt = this.block().publishedAt;
    return publishedAt ? new Date(publishedAt) : new Date();
  });
  readonly displayIso = computed(() => {
    const date = this.displayDate();
    return isNaN(date.getTime()) ? '' : date.toISOString();
  });
}

export const BYLINE_DATE_FORMAT = DISPLAY_FORMAT;
