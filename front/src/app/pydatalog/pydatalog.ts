import { Component, signal } from '@angular/core';
import { BaseConocimiento } from './base-conocimiento/base-conocimiento';
import { FormularioHecho } from './formulario-hecho/formulario-hecho';
import { FormularioRegla } from './formulario-regla/formulario-regla';
import { PanelConsulta } from './panel-consulta/panel-consulta';

@Component({
  selector: 'app-pydatalog',
  imports: [FormularioHecho, FormularioRegla, PanelConsulta, BaseConocimiento],
  templateUrl: './pydatalog.html',
  host: { class: 'flex min-h-0 flex-1' },
})
export class Pydatalog {
  protected readonly pestana = signal<'hecho' | 'regla'>('hecho');
}
