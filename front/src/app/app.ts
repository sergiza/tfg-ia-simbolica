import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

const ENLACE = 'border-b-2 px-4 py-4 text-sm font-semibold tracking-wide uppercase';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly enlaceActivo = `${ENLACE} border-indigo-600 text-indigo-700`;
  protected readonly enlaceInactivo = `${ENLACE} border-transparent text-slate-500 hover:text-slate-700`;
}
