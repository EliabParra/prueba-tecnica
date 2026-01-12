import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Store } from '../../../interfaces/Store';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-stores-form',
  templateUrl: './stores-form.component.html',
  styleUrls: ['./stores-form.component.scss']
})
export class StoresFormComponent implements OnInit {

  constructor (
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StoresFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Store
  ) { }

  ngOnInit(): void {}

  storesForm = this.fb.group({
    name: [this.data.name, Validators.required],
    location: [this.data.location, Validators.required]
  })

  get name(): AbstractControl {
    return this.storesForm.get('name');
  }

  get location(): AbstractControl {
    return this.storesForm.get('location');
  }

  onSubmit() {
    const store: Store = {
      id: this.data?.id,
      name: this.name.value,
      location: this.location.value
    };
    this.dialogRef.close(store);
  }

}
