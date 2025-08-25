import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { CanvasEditStateService } from '../../services/canvas-edit-state/canvas-edit-state.service';

@Directive({
  selector: '[authorScope]',
  standalone: true,
})
export class AuthorScopeDirective {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private editState = inject(CanvasEditStateService);

  // Emits when the authoring focus enters/exits scope
  @Output() authorEditingChange = new EventEmitter<boolean>();

  // Let nested controls tell the scope we're "editing"
  @Input({ alias: 'authorScopeChildEditing' })
  set childEditing(status: boolean | null | undefined) {
    if (status == null) return;
    this.editState.setEditing(status);
    this.authorEditingChange.emit(status);
  }

  @HostListener('focusin')
  onFocusIn() {
    this.editState.start();
    this.authorEditingChange.emit(true);
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(e: FocusEvent) {
    const next = e.relatedTarget as Node | null;
    if (!next || !this.host.nativeElement.contains(next)) {
      this.editState.stop();
      this.authorEditingChange.emit(false);
    }
  }
}
