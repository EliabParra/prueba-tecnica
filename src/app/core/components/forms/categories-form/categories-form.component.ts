import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '../../../interfaces/Category';

@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.scss']
})
export class CategoriesFormComponent {
  private readonly namePattern = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s\-_.]{2,100}$/

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CategoriesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Category
  ) {}

  form = this.fb.group({
    name: [this.data?.name ?? '', [Validators.required, Validators.pattern(this.namePattern)]],
    description: [this.data?.description ?? '']
  })

  get name(): AbstractControl { return this.form.get('name') }
  get description(): AbstractControl { return this.form.get('description') }

  onSubmit() {
    const category: Category = {
      id: this.data?.id ?? 0,
      name: this.name.value,
      description: this.description.value
    }
    this.dialogRef.close(category)
  }
}
