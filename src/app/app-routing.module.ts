import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ProductsComponent } from './pages/products/products.component';
import { WarehousesComponent } from './pages/warehouses/warehouses.component';
import { StockComponent } from './pages/stock/stock.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ReportsComponent } from './pages/reports/reports.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { InventoryMovementsComponent } from './pages/inventory-movements/inventory-movements.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '404', component: NotFoundComponent },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'products/:id', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'warehouses', component: WarehousesComponent, canActivate: [AuthGuard] },
  { path: 'warehouses/:id', component: WarehousesComponent, canActivate: [AuthGuard] },
  { path: 'stock', component: StockComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  { path: 'movements', component: InventoryMovementsComponent, canActivate: [AuthGuard] },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
