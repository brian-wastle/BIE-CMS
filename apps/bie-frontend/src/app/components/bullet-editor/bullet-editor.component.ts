import {
  afterRenderEffect,
  Component,
  ElementRef,
  model,
  signal,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bullet-editor',
  imports: [CommonModule],
  templateUrl: './bullet-editor.component.html',
  styleUrl: './bullet-editor.component.scss',
})
export class BulletEditorComponent {
  items = model<string[]>([]);
  rows = signal<string[]>(['']);
  pendingFocusIndex = signal<number | null>(null);

  bulletInputs = viewChildren<ElementRef<HTMLInputElement>>('bulletInput');

  constructor() {
    const initial = this.items();
    if (initial.length) {
      this.rows.set([...initial]);
    } else {
      this.rows.set(['']);
    }

    afterRenderEffect({
      write: () => {
        const index = this.pendingFocusIndex();
        if (index === null) {
          return;
        }

        const input = this.bulletInputs()[index]?.nativeElement;
        if (input) {
          input.focus();
          this.pendingFocusIndex.set(null);
        }
      },
    });
  }

  onInput(index: number, value: string): void {
    this.rows.update(rows => {
      const next = [...rows];
      next[index] = value;
      return next;
    });
  }

  onEnter(index: number, event: Event): void {
    event.preventDefault();

    const rows = this.rows();
    const currentValue = rows[index]?.trim() ?? '';

    if (!currentValue) {
      return;
    }

    if (index === rows.length - 1) {
      this.rows.set([...rows, '']);
      this.pendingFocusIndex.set(index + 1);
      return;
    }

    this.pendingFocusIndex.set(index + 1);
  }

  onBackspace(index: number, input: HTMLInputElement, event: Event): void {
    const rows = this.rows();
    const value = rows[index] ?? '';

    const caretAtStart =
      input.selectionStart === 0 && input.selectionEnd === 0;

    if (!caretAtStart || value !== '' || rows.length === 1) {
      return;
    }

    event.preventDefault();

    const next = rows.filter((_, i) => i !== index);
    this.rows.set(next.length ? next : ['']);
    this.pendingFocusIndex.set(Math.max(0, index - 1));
  }

  onFocusOut(): void {
    queueMicrotask(() => {
      const active = document.activeElement;
      const stillInside = this.bulletInputs()
        .some(ref => ref.nativeElement === active);

      if (!stillInside) {
        this.commit();
      }
    });
  }

  private commit(): void {
    const cleaned = this.rows()
      .map(value => value.trim())
      .filter(value => value.length > 0);

    this.items.set(cleaned);
    this.rows.set(cleaned.length ? [...cleaned] : ['']);
  }
}
