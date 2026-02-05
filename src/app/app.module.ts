import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { WarehousesComponent } from './pages/warehouses/warehouses.component';
import { StockComponent } from './pages/stock/stock.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ProductsFormComponent } from './core/components/forms/products-form/products-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LoginComponent } from './pages/login/login.component';
import { WarehousesFormComponent } from './core/components/forms/warehouses-form/warehouses-form.component';
import { StockFormComponent } from './core/components/forms/stock-form/stock-form.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AlertComponent } from './core/components/alert/alert.component';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardBottomSheetComponent } from './core/components/dashboard-bottom-sheet/dashboard-bottom-sheet.component';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { ReportsComponent } from './pages/reports/reports.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { CategoriesFormComponent } from './core/components/forms/categories-form/categories-form.component';
import { InventoryMovementsComponent } from './pages/inventory-movements';
import { ConfirmDialogComponent } from './core/components/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProductsComponent,
    WarehousesComponent,
    StockComponent,
    SidebarComponent,
    NotFoundComponent,
    ProductsFormComponent,
    WarehousesFormComponent,
    StockFormComponent,
    AlertComponent,
    DashboardBottomSheetComponent,
    LoginComponent,
    ReportsComponent,
    CategoriesComponent,
    CategoriesFormComponent,
    InventoryMovementsComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatGridListModule,
    MatToolbarModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatBottomSheetModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
