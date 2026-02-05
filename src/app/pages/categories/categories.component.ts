import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { NavigationService } from '../../core/services/navigation.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Category } from '../../core/interfaces/Category';
import { CategoriesFormComponent } from '../../core/components/forms/categories-form/categories-form.component';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, AfterViewInit {
  constructor(
    private navigationService: NavigationService,
    private categoriesService: CategoriesService,
    private dialog: MatDialog
  ) {}

  dataSource = new MatTableDataSource<Category>([])
  displayedColumns: string[] = ['id', 'name', 'description', 'actions']

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  ngOnInit(): void {
    this.navigationService.setTitle('Categorías')
    this.categoriesService.syncDB().then()
    this.categoriesService.categories$.subscribe(list => {
      this.dataSource.data = list
      this.dataSource.filter = ''
    }
    )
    this.dataSource.filterPredicate = (data, filter) => {
      const q = filter.trim().toLowerCase()
      if (!q) return true
      return (data.name || '').toLowerCase().includes(q) || (data.description || '').toLowerCase().includes(q)
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  openCreateCategoryModal() {
    const dialogRef = this.dialog.open(CategoriesFormComponent, {
      width: '32rem',
      data: { name: '', description: '' },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async category => {
      if (category) await this.categoriesService.addCategory(category)
    })
  }

  openEditCategoryModal(category: Category) {
    const dialogRef = this.dialog.open(CategoriesFormComponent, {
      width: '32rem',
      data: category,
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async category => {
      if (category) await this.categoriesService.updateCategory(category)
    })
  }

  async deleteCategory(category: Category) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '28rem',
      data: {
        title: 'Eliminar categoría',
        message: `¿Seguro que deseas eliminar "${category.name}"?`,
        confirmText: 'Eliminar'
      },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async confirmed => {
      if (!confirmed) return
      await this.categoriesService.deleteCategory(category)
      this.applyFilter(this.dataSource.filter)
    })
  }

  applyFilter(value: string) {
    this.dataSource.filter = (value || '').toString().trim().toLowerCase()
    if (this.paginator) this.paginator.firstPage()
  }
}
