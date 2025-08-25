import { Component, ElementRef, EventEmitter, Output, input, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBlock, GridPlacement, BlockUpdate } from 'bie-models';
import { AuthorScopeDirective } from '../../directives/author-scope/author-scope.directive';
import { CanvasEditStateService } from '../../services/canvas-edit-state/canvas-edit-state.service';

@Component({
  selector: 'app-blog-byline',
  standalone: true,
  imports: [CommonModule, AuthorScopeDirective],
  templateUrl: './blog-byline.component.html',
  styleUrl: './blog-byline.component.scss'
})
export class BlogBylineComponent {
  readonly block = input.required<TextBlock>();
  readonly editable = input(true);
  readonly totalColumns = input(12);

  readonly editorRef = viewChild<ElementRef<HTMLElement>>('editor');

  @Output() editingChange = new EventEmitter<boolean>();
  @Output() update = new EventEmitter<BlockUpdate>();

  constructor(
    public editState: CanvasEditStateService
  ) { }


}
