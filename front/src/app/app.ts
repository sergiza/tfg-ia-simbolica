import { Component, inject, signal } from '@angular/core';
import { BaseConocimiento } from './base-conocimiento/base-conocimiento';
import { ConocimientoService } from './conocimiento-service';
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
  protected readonly kb = inject(ConocimientoService);
  protected readonly pestana = signal<'hecho' | 'regla'>('hecho');

  protected reiniciar(): void {
    if (
      !confirm('¿Reiniciar? Se vaciará la base de conocimiento y el contenido de los desplegables.')
    ) {
      return;
    }
    this.pestana.set('hecho');
    this.kb.reiniciar();
  }
}
