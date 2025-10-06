import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridPlacement } from 'bie-models';
import { LayoutControlsComponent } from '../layout-controls/layout-controls.component';
import { AuthorScopeDirective } from '../../directives/author-scope/author-scope.directive';
import { BLOCK_SHELL } from './block-shell';

@Component({
  selector: 'app-block-shell-template',
  standalone: true,
  imports: [CommonModule, LayoutControlsComponent, AuthorScopeDirective],
  templateUrl: './block-shell-template.component.html',
})
export class BlockShellTemplateComponent {
  private readonly shell = inject(BLOCK_SHELL, { optional: true });

  @Input() editable?: boolean;
  @Input() layout?: GridPlacement;
  @Input() totalColumns?: number;
  @Input() editClass = '';
  @Input() previewClass = '';
  @Input() controlsClass = '';
  @Input() editAriaLabel: string | null = null;

  @Output() editingChange = new EventEmitter<boolean>();
  @Output() layoutChange = new EventEmitter<GridPlacement>();

  get resolvedEditable(): boolean {
    return this.editable ?? this.shell?.editable() ?? true;
  }

  get resolvedLayout(): GridPlacement | undefined {
    return this.layout ?? (this.shell?.block() as { layout?: GridPlacement })?.layout;
  }

  get resolvedTotalColumns(): number {
    return this.totalColumns ?? this.shell?.totalColumns() ?? 12;
  }

  onLayoutChange(layout: GridPlacement) {
    this.shell?.update.emit({ layout });
    this.layoutChange.emit(layout);
  }

  onEditingChange(editing: boolean) {
    this.shell?.editingChange.emit(editing);
    this.editingChange.emit(editing);
  }
}
