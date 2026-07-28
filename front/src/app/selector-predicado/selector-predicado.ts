import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Combobox, GrupoCombo } from '../combobox/combobox';
import { ConocimientoService } from '../conocimiento-service';
import { OPCION_PREDICADO, SELECT_PREDICADO } from '../estilos';
import {
  ARIDADES,
  COMPARADORES,
  PredicadoDeclarado,
  esComparador,
  esNombreValido,
} from '../modelos';

@Component({
  selector: 'app-selector-predicado',
  templateUrl: './selector-predicado.html',
  imports: [Combobox],
})
export class SelectorPredicado {
  protected readonly kb = inject(ConocimientoService);

  readonly valor = input('');
  readonly etiqueta = input('Predicado');
  readonly comparadores = input(false);
  readonly cambio = output<string>();
  readonly operador = output<string>();
  readonly borrador = output<PredicadoDeclarado | null>();

  protected readonly estiloEntrada = SELECT_PREDICADO;
  protected readonly aridades = ARIDADES;

  protected readonly creando = signal(false);
  protected readonly nombreNuevo = signal('');
  protected readonly aridadNueva = signal(2);

  protected readonly nombreValido = computed(() => esNombreValido(this.nombreNuevo().trim()));

  protected readonly etiquetaCrear = (texto: string): string =>
    texto === '' ? '+ nuevo predicado…' : `+ crear «${texto}»`;

  protected readonly grupos = computed<GrupoCombo[]>(() => {
    const predicados = {
      titulo: this.comparadores() ? 'Predicados' : null,
      opciones: this.kb.vocabulario().map((p) => ({
        valor: p.nombre,
        etiqueta: p.nombre,
        nota: `${p.aridad} términos`,
        clase: OPCION_PREDICADO,
      })),
    };

    if (!this.comparadores()) {
      return [predicados];
    }

    return [
      predicados,
      {
        titulo: 'Comparaciones',
        opciones: COMPARADORES.map((c) => ({
          valor: c.simbolo,
          etiqueta: c.simbolo,
          nota: c.nombre,
          clase: OPCION_PREDICADO,
        })),
      },
    ];
  });

  protected elegir(valor: string): void {
    if (esComparador(valor)) {
      this.operador.emit(valor);
      return;
    }
    this.cambio.emit(valor);
  }

  protected pedirCrear(texto: string): void {
    this.nombreNuevo.set(texto.trim().toLowerCase());
    this.creando.set(true);
    this.emitirBorrador();
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
