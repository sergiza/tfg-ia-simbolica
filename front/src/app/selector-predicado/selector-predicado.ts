import { Component, computed, inject, input, output, signal } from '@angular/core';
import { ConocimientoService } from '../conocimiento-service';
import { SELECT_PREDICADO } from '../estilos';
import { PredicadoDeclarado, esNombreValido } from '../modelos';

@Component({
  selector: 'app-selector-predicado',
  templateUrl: './selector-predicado.html',
})
export class SelectorPredicado {
  protected readonly kb = inject(ConocimientoService);

  readonly valor = input('');
  readonly etiqueta = input('Predicado');
  readonly cambio = output<string>();
  readonly borrador = output<PredicadoDeclarado | null>();

  protected readonly estiloSelect = SELECT_PREDICADO;

  protected readonly creando = signal(false);
  protected readonly nombreNuevo = signal('');
  protected readonly aridadNueva = signal(2);

  protected readonly nombreValido = computed(() => esNombreValido(this.nombreNuevo().trim()));

  protected elegir(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    if (valor === '__nuevo__') {
      this.creando.set(true);
      this.nombreNuevo.set('');
      this.emitirBorrador();
      return;
    }
    this.cambio.emit(valor);
  }

  protected actualizarNombre(evento: Event): void {
    this.nombreNuevo.set((evento.target as HTMLInputElement).value.toLowerCase());
    this.emitirBorrador();
  }

  protected actualizarAridad(evento: Event): void {
    this.aridadNueva.set(Number((evento.target as HTMLSelectElement).value));
    this.emitirBorrador();
  }

  protected crear(): void {
    const nombre = this.nombreNuevo().trim();
    this.kb.declararPredicado(nombre, this.aridadNueva());
    this.creando.set(false);
    this.borrador.emit(null);
    this.cambio.emit(nombre);
  }

  protected cancelar(): void {
    this.creando.set(false);
    this.borrador.emit(null);
  }

  private emitirBorrador(): void {
    this.borrador.emit({ nombre: this.nombreNuevo().trim(), aridad: this.aridadNueva() });
  }
}
