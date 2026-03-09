import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BulletEditorComponent } from '../../components/bullet-editor/bullet-editor.component';

@Component({
  selector: 'app-recipe-generator',
  imports: [ReactiveFormsModule, BulletEditorComponent, JsonPipe],
  templateUrl: './recipe-generator.component.html',
  styleUrl: './recipe-generator.component.scss',
})
export class RecipeGeneratorComponent {
  titleControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(42)],
  });

  blurbControl = new FormControl<string>('', {
    nonNullable: true,
  });

  ingredients = signal<string[]>([]);
  instructions = signal<string[]>([]);
  notes = signal<string[]>([]);

  submit(): void {
    const recipe = {
      title: this.titleControl.value,
      blurb: this.blurbControl.value,
      ingredients: this.ingredients(),
      instructions: this.instructions(),
      notes: this.notes(),
    };

    console.log(recipe);
  }
}