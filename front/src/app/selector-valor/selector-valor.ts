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
import { LETRAS_VARIABLES, esNombreValido } from '../modelos';

@Component({
  selector: 'app-selector-valor',
  templateUrl: './selector-valor.html',
  imports: [Combobox],
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

  protected readonly estiloEntrada = computed(() => {
    if (this.variables() === null) {
      return SELECT_CONSTANTE;
    }
    if (this.valor() === '') {
      return SELECT_NEUTRO;
    }
    return LETRAS_VARIABLES.includes(this.valor()) ? SELECT_VARIABLE : SELECT_CONSTANTE;
  });

  protected readonly grupos = computed<GrupoCombo[]>(() => {
    const constantes: OpcionCombo[] = this.kb
      .terminos()
      .map((t) => ({ valor: t, etiqueta: t, clase: OPCION_CONSTANTE }));

    const variables = this.variables();
    if (variables === null) {
      return [{ titulo: null, opciones: constantes }];
    }

    const opciones: OpcionCombo[] = variables.map((v) => ({
      valor: v,
      etiqueta: v,
      clase: OPCION_VARIABLE,
    }));
    const nueva = this.nuevaVariable();
    if (nueva !== null) {
      opciones.push({ valor: nueva, etiqueta: nueva, nota: 'nueva', clase: OPCION_VARIABLE });
    }

    return [
      { titulo: 'Variables', opciones },
      { titulo: 'Constantes', opciones: constantes },
    ];
  });

  protected elegir(valor: string): void {
    this.cambio.emit(valor);
  }

  protected pedirCrear(texto: string): void {
    const nombre = texto.trim().toLowerCase();
    if (esNombreValido(nombre)) {
      this.kb.registrarConstante(nombre);
      this.cambio.emit(nombre);
      return;
    }
    this.nombreNuevo.set(nombre);
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
