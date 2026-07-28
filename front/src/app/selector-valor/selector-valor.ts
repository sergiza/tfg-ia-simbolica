import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Combobox, GrupoCombo, OpcionCombo } from '../combobox/combobox';
import { ConocimientoService } from '../conocimiento-service';
import {
  OPCION_CONSTANTE,
  OPCION_VARIABLE,
  SELECT_CONSTANTE,
  SELECT_NEUTRO,
  SELECT_VARIABLE,
} from '../estilos';
import { esConstanteValida, esNombreValido, esNumero, esVariable } from '../modelos';

@Component({
  selector: 'app-selector-valor',
  templateUrl: './selector-valor.html',
  imports: [Combobox],
})
export class SelectorValor {
  protected readonly kb = inject(ConocimientoService);

  readonly valor = input('');
  readonly etiqueta = input('Valor');
  readonly ancho = input('w-40');
  readonly variables = input<string[] | null>(null);
  readonly nuevaVariable = input<string | null>(null);
  readonly cambio = output<string>();

  protected readonly creando = signal(false);
  protected readonly nombreNuevo = signal('');

  protected readonly nombreValido = computed(() => esConstanteValida(this.nombreNuevo().trim()));

  protected readonly estiloEntrada = computed(() => {
    if (this.variables() === null) {
      return SELECT_CONSTANTE;
    }
    if (this.valor() === '') {
      return SELECT_NEUTRO;
    }
    return esVariable(this.valor()) ? SELECT_VARIABLE : SELECT_CONSTANTE;
  });

  protected readonly grupos = computed<GrupoCombo[]>(() => {
    const grupos: GrupoCombo[] = [];

    const variables = this.variables();
    if (variables !== null) {
      const opciones: OpcionCombo[] = variables.map((v) => ({
        valor: v,
        etiqueta: v,
        clase: OPCION_VARIABLE,
      }));
      const nueva = this.nuevaVariable();
      if (nueva !== null) {
        opciones.push({ valor: nueva, etiqueta: nueva, nota: 'nueva', clase: OPCION_VARIABLE });
      }
      grupos.push({ titulo: 'Variables', opciones });
    }

    const constantes = this.kb.constantes();
    if (constantes.length > 0) {
      grupos.push({
        titulo: 'Constantes',
        opciones: constantes.map((t) => ({ valor: t, etiqueta: t, clase: OPCION_CONSTANTE })),
      });
    }

    const numeros = this.kb.numeros();
    if (numeros.length > 0) {
      grupos.push({
        titulo: 'Números',
        opciones: numeros.map((n) => ({ valor: n, etiqueta: n, clase: OPCION_CONSTANTE })),
      });
    }

    return grupos.length === 1 ? [{ ...grupos[0], titulo: null }] : grupos;
  });

  protected readonly etiquetaCrear = (texto: string): string => {
    if (texto === '') {
      return '+ nueva constante…';
    }
    return esNumero(texto) ? `+ usar el número ${texto}` : `+ crear «${texto}»`;
  };

  protected elegir(valor: string): void {
    this.cambio.emit(valor);
  }

  protected pedirCrear(texto: string): void {
    const valor = texto.trim().toLowerCase();
    if (esNumero(valor)) {
      this.cambio.emit(valor);
      return;
    }
    if (esNombreValido(valor)) {
      this.kb.registrarConstante(valor);
      this.cambio.emit(valor);
      return;
    }
    this.nombreNuevo.set(valor);
    this.creando.set(true);
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
