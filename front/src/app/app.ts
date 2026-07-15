import { Component, signal } from '@angular/core';
import { BaseConocimiento } from './base-conocimiento/base-conocimiento';
import { FormularioHecho } from './formulario-hecho/formulario-hecho';
import { FormularioRegla } from './formulario-regla/formulario-regla';
import { PanelConsulta } from './panel-consulta/panel-consulta';

@Component({
  selector: 'app-root',
  imports: [FormularioHecho, FormularioRegla, PanelConsulta, BaseConocimiento],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly pestana = signal<'hecho' | 'regla'>('hecho');
}
