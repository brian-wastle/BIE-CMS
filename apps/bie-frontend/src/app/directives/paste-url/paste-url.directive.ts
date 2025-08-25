import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[pasteUrl]',
  standalone: true,
})
export class PasteUrlDirective {
  @Output() pasteUrl = new EventEmitter<string>();

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent) {
    const t = e.clipboardData?.getData('text/plain')?.trim();
    if (t && /^https?:\/\//i.test(t)) {
      e.preventDefault();
      this.pasteUrl.emit(t);
    }
  }
}
