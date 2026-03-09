import { Component } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-recipe-generator',
  imports: [ReactiveFormsModule],
  templateUrl: './recipe-generator.component.html',
  styleUrl: './recipe-generator.component.scss',
})
export class RecipeGeneratorComponent {
  ingredientForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.ingredientForm = this.fb.group({
      ingredients: this.fb.array<FormControl<string>>([
        this.createIngredientControl()
      ])
    });   
  }

  // Title

  // Blurb

  // Ingredients
  // Return all ingredients
  get ingredients(): FormArray<FormControl<string>> {
    return this.ingredientForm.get('ingredients') as FormArray<FormControl<string>>;
  }

  // Create new control
  createIngredientControl(): FormControl<string> {
    return this.fb.nonNullable.control('', Validators.required);
  }

  // Add an ingredient input 
  addIngredient(): void {
    this.ingredients.push(this.createIngredientControl());
  }

  // Remove an ingredient input 
  removeIngredient(index: number): void {
    if (this.ingredients.length === 1) {
      this.ingredients.at(0).setValue('');
      return;
    }

    this.ingredients.removeAt(index);
  }

  // Instructions
  
  // Notes
}
