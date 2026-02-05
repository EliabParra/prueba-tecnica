import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Warehouse } from '../../../interfaces/Warehouse';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-warehouses-form',
  templateUrl: './warehouses-form.component.html',
  styleUrls: ['./warehouses-form.component.scss']
})
export class WarehousesFormComponent implements OnInit {

  constructor (
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WarehousesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Warehouse
  ) { }

  ngOnInit(): void {}

  private readonly namePattern = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s\-_.]{2,100}$/
  private readonly locationPattern = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s\-_.#/,]{2,200}$/

  warehousesForm = this.fb.group({
    name: [this.data?.name ?? '', [Validators.required, Validators.pattern(this.namePattern)]],
    location: [this.data?.location ?? '', [Validators.required, Validators.pattern(this.locationPattern)]]
  })

  get name(): AbstractControl {
    return this.warehousesForm.get('name');
  }

  get location(): AbstractControl {
    return this.warehousesForm.get('location');
  }

  onSubmit() {
    const warehouse: Warehouse = {
      id: this.data?.id,
      name: this.name.value,
      location: this.location.value
    };
    this.dialogRef.close(warehouse);
  }

}
