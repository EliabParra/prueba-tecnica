import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Alert } from '../../interfaces/Alert';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
  ,
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ transform: 'scale(.92)', opacity: 0 }),
        animate('180ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('120ms linear', style({ transform: 'scale(.92)', opacity: 0 }))
      ])
    ])
  ]
})
export class AlertComponent implements OnInit {

  constructor (
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AlertComponent>,
    @Inject(MAT_DIALOG_DATA) public alert: Alert
  ) { }

  @HostBinding('@dialogAnimation') public animate = true

  ngOnInit(): void {
  }

}
