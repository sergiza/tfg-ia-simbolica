import { Component, computed, inject, signal } from '@angular/core';
import { BibliotecaService } from '../../biblioteca/biblioteca-service';
import { ConocimientoService } from '../conocimiento-service';
import { formatearRegla, formatearTerminos } from '../modelos';

@Component({
  selector: 'app-base-conocimiento',
  templateUrl: './base-conocimiento.html',
})
export class BaseConocimiento {
  protected readonly kb = inject(ConocimientoService);
  private readonly biblioteca = inject(BibliotecaService);

  protected readonly formatearRegla = formatearRegla;
  protected readonly formatearTerminos = formatearTerminos;

  protected readonly vacia = computed(
    () => this.kb.hechos().length === 0 && this.kb.reglas().length === 0,
  );

  protected readonly guardando = signal(false);
  protected readonly nombre = signal('');
  protected readonly descripcion = signal('');
  protected readonly errorGuardar = signal<string | null>(null);

  protected abrirGuardar(): void {
    this.nombre.set('');
    this.descripcion.set('');
    this.errorGuardar.set(null);
    this.guardando.set(true);
  }

  protected cancelarGuardar(): void {
    this.guardando.set(false);
  }

  protected async guardar(evento: Event): Promise<void> {
    evento.preventDefault();
    if (this.nombre().trim() === '') {
      return;
    }
    try {
      await this.biblioteca.guardar(this.nombre().trim(), this.descripcion());
      this.guardando.set(false);
    } catch {
      this.errorGuardar.set('No se pudo guardar.');
    }
  }
}
