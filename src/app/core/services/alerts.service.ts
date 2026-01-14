import { Injectable } from '@angular/core';
import { Alert } from '../interfaces/Alert';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../components/alert/alert.component';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  constructor (
    private dialog: MatDialog
  ) { }

  public showAlert(alert: Alert): void {
    this.dialog.open(AlertComponent, {
      data: alert,
      autoFocus: false,
      panelClass: 'alert-dialog'
    })
  }
}
