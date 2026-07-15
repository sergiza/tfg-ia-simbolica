import { Component, computed, inject, input, output, signal } from '@angular/core';
import { ConocimientoService } from '../conocimiento-service';
import { SELECT_CONSTANTE, SELECT_NEUTRO, SELECT_VARIABLE } from '../estilos';
import { LETRAS_VARIABLES, esNombreValido } from '../modelos';

@Component({
  selector: 'app-selector-valor',
  templateUrl: './selector-valor.html',
})
export class SelectorValor {
  protected readonly kb = inject(ConocimientoService);

  readonly valor = input('');
  readonly etiqueta = input('Valor');
  readonly variables = input<string[] | null>(null);
  readonly nuevaVariable = input<string | null>(null);
  readonly cambio = output<string>();

  protected readonly creando = signal(false);
  protected readonly nombreNuevo = signal('');

  protected readonly nombreValido = computed(() => esNombreValido(this.nombreNuevo().trim()));

  protected readonly estiloSelect = computed(() => {
    if (this.variables() === null) {
      return SELECT_CONSTANTE;
    }
    if (this.valor() === '') {
      return SELECT_NEUTRO;
    }
    return LETRAS_VARIABLES.includes(this.valor()) ? SELECT_VARIABLE : SELECT_CONSTANTE;
  });

  protected elegir(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    if (valor === '__nueva__') {
      this.creando.set(true);
      this.nombreNuevo.set('');
      return;
    }
    this.cambio.emit(valor);
  }

  protected actualizarNombre(evento: Event): void {
    this.nombreNuevo.set((evento.target as HTMLInputElement).value.toLowerCase());
  }

  protected crear(): void {
    const nombre = this.nombreNuevo().trim();
    this.kb.registrarConstante(nombre);
    this.creando.set(false);
    this.cambio.emit(nombre);
  }

  protected cancelar(): void {
    this.creando.set(false);
  }
}
