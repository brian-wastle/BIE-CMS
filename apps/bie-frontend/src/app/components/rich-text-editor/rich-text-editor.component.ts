import { Component, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import type { QuillModules } from 'ngx-quill/config';

@Component({
  selector: 'app-rich-text-editor',
  imports: [CommonModule, FormsModule, QuillEditorComponent],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss'
})
export class RichTextEditorComponent {
  readonly modules: QuillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ]
  };

  readonly value = model<string>('');
  readonly placeholder = input<string>('Start writing...');
  readonly debounceTime = input(150);
  readonly disabled = input(false);

  onEditorChange(content: string | null | undefined) {
    this.value.set(content ?? '');
  }
}
