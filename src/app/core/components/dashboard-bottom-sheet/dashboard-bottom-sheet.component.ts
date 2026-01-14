import { Component, OnInit } from '@angular/core'
import { MatBottomSheetRef } from '@angular/material/bottom-sheet'
import { Router } from '@angular/router'

@Component({
  selector: 'app-dashboard-bottom-sheet',
  templateUrl: './dashboard-bottom-sheet.component.html',
  styleUrls: ['./dashboard-bottom-sheet.component.scss']
})
export class DashboardBottomSheetComponent implements OnInit {

  constructor (
    private bottomSheetRef: MatBottomSheetRef<DashboardBottomSheetComponent>,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  navigateTo(path: string): void {
    this.bottomSheetRef.dismiss()
    this.router.navigate([path])
  }
}
