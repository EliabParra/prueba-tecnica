import { Injectable } from '@angular/core';
import { Alert } from '../interfaces/Alert';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../components/alert/alert.component';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  constructor (
    private dialog: MatDialog
  ) { }

  private STORAGE_KEY = 'prueba_recent_activities'

  private recentActivities: BehaviorSubject<Alert[]> = new BehaviorSubject<Alert[]>(this.loadFromStorage())
  public recentActivities$ = this.recentActivities.asObservable()

  private maxItems = 10

  private loadFromStorage(): Alert[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed as Alert[] : []
    } catch (e) {
      return []
    }
  }

  private saveToStorage(items: Alert[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items.slice(-this.maxItems)))
    } catch (e) {
      // ignore storage errors silently
    }
  }

  private readonly alertDialogId = 'global-alert'
  private pendingAlert: Alert | null = null

  public showAlert(alert: Alert): void {
    const existing = this.dialog.getDialogById(this.alertDialogId)
    if (existing) {
      this.pendingAlert = alert
      existing.close()
      existing.afterClosed().subscribe(() => {
        if (!this.pendingAlert) return
        const nextAlert = this.pendingAlert
        this.pendingAlert = null
        this.openAlert(nextAlert)
      })
      return
    }
    this.openAlert(alert)
  }

  private openAlert(alert: Alert): void {
    this.dialog.open(AlertComponent, {
      data: alert,
      autoFocus: false,
      panelClass: 'alert-dialog',
      id: this.alertDialogId
    })
    if (alert.type === 'success') {
      const next = [...this.recentActivities.value, alert]
      this.recentActivities.next(next)
      this.saveToStorage(next)
    }
  }

  public clearRecentActivities() {
    this.recentActivities.next([])
    try { localStorage.removeItem(this.STORAGE_KEY) } catch (e) { }
  }
}
