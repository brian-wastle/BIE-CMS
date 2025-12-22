import { Component, input, output, HostListener, ElementRef } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ColorSketchModule } from 'ngx-color/sketch';
import type { ColorEvent } from 'ngx-color';

@Component({
  selector: 'app-color-picker-input',
  imports: [FormsModule, ColorSketchModule],
  templateUrl: './color-picker-input.component.html',
  styleUrl: './color-picker-input.component.scss'
})
export class ColorPickerInputComponent {
  color = input<string>('000');
  colorChange = output<string>();
  showPicker = false;

  constructor(
    private host: ElementRef<HTMLElement>
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    const clickedInside = !!target && this.host.nativeElement.contains(target);

    if (!clickedInside && this.showPicker) {
      this.showPicker = false;
    }
  }

  openPicker(event?: MouseEvent) {
    event?.stopPropagation();
    this.showPicker = true;
  }

  handleChangeComplete(ev: ColorEvent) {
    const hex = ev.color.hex;
    this.colorChange.emit(hex);
    this.showPicker = false;
  }
}



