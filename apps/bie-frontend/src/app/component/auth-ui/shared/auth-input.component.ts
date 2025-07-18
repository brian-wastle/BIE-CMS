import { Component, Input } from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector    : 'auth-input',
  standalone  : true,
  imports     : [ReactiveFormsModule, NgIf],
  template    : `
    <label class="block mb-3">
      <span class="text-sm">{{label}}</span>
      <input [type]="type"
             [formControl]="ctrl"
             class="w-full p-2 border rounded" />
    </label>
    <p *ngIf="ctrl.invalid && ctrl.touched"
       class="text-xs text-red-600">
       {{error}}
    </p>
  `
})
export class AuthInputComponent {
  @Input({ required: true }) ctrl!: FormControl;
  @Input({ required: true }) label!: string;
  @Input() type: string = 'text';
  @Input() error = 'Required';
}
