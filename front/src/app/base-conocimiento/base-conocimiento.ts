import { Component, inject } from '@angular/core';
import { ConocimientoService } from '../conocimiento-service';
import { Regla } from '../modelos';

@Component({
  selector: 'app-base-conocimiento',
  templateUrl: './base-conocimiento.html',
})
export class BaseConocimiento {
  protected readonly kb = inject(ConocimientoService);

  protected formatearRegla(regla: Regla): string {
    const cabeza = `${regla.cabeza.predicado}(${regla.cabeza.variables.join(', ')})`;
    const cuerpo = regla.cuerpo
      .map((lit) => `${lit.predicado}(${lit.argumentos.join(', ')})`)
      .join(' & ');
    return `${cabeza} <= ${cuerpo}`;
  }
}
