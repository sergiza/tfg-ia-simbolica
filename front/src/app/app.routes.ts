import { Routes } from '@angular/router';
import { Biblioteca } from './biblioteca/biblioteca';
import { Home } from './home/home';
import { Pydatalog } from './pydatalog/pydatalog';

export const routes: Routes = [
  { path: '', component: Home, title: 'DatalogVisual' },
  { path: 'pydatalog', component: Pydatalog, title: 'Editor' },
  { path: 'biblioteca', component: Biblioteca, title: 'Biblioteca' },
  { path: '**', redirectTo: '' },
];
