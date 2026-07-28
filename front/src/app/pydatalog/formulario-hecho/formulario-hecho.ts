import { Component, computed, inject, signal } from '@angular/core';
import { ConocimientoService } from '../conocimiento-service';
import { SelectorPredicado } from '../selector-predicado/selector-predicado';
import { SelectorValor } from '../selector-valor/selector-valor';

@Component({
  selector: 'app-formulario-hecho',
  imports: [SelectorPredicado, SelectorValor],
  templateUrl: './formulario-hecho.html',
})
export class FormularioHecho {
  protected readonly kb = inject(ConocimientoService);

  protected readonly predicado = signal('');
  protected readonly terminos = signal<string[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly valido = computed(
    () =>
      this.predicado() !== '' &&
      this.terminos().length > 0 &&
      this.terminos().every((t) => t !== ''),
  );

  protected elegirPredicado(nombre: string): void {
    this.predicado.set(nombre);
    this.terminos.set(Array(this.kb.aridad(nombre)).fill(''));
    this.error.set(null);
  }

  protected ponerTermino(indice: number, valor: string): void {
    this.terminos.update((terminos) => terminos.with(indice, valor));
  }

  protected async enviar(evento: Event): Promise<void> {
    evento.preventDefault();
    if (!this.valido()) {
      return;
    }
    this.error.set(null);
    try {
      await this.kb.addHecho({ predicado: this.predicado(), terminos: this.terminos() });
      this.terminos.update((terminos) => terminos.map(() => ''));
    } catch {
      this.error.set('No se pudo añadir el hecho. Comprueba que el servidor está en marcha.');
    }
  }
}
