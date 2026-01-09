import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ProductsComponent } from './pages/products/products.component';
import { StoresComponent } from './pages/stores/stores.component';
import { StockComponent } from './pages/stock/stock.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '404', component: NotFoundComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductsComponent },
  { path: 'stores', component: StoresComponent },
  { path: 'stores/:id', component: StoresComponent },
  { path: 'stock', component: StockComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
