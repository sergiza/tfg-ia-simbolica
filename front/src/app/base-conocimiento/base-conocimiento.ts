import { Component, inject } from '@angular/core';
import { ConocimientoService } from '../conocimiento-service';
import { formatearRegla, formatearTerminos } from '../modelos';

@Component({
  selector: 'app-base-conocimiento',
  templateUrl: './base-conocimiento.html',
})
export class BaseConocimiento {
  protected readonly kb = inject(ConocimientoService);

  protected readonly formatearRegla = formatearRegla;
  protected readonly formatearTerminos = formatearTerminos;
}
