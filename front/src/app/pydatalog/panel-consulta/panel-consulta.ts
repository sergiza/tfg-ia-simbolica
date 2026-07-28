import { Component, computed, inject, signal } from '@angular/core';
import { Combobox, GrupoCombo } from '../../comun/combobox/combobox';
import { ConocimientoService, mensajeError } from '../conocimiento-service';
import {
  BOTON_EXTENDER,
  OPCION_CONSTANTE,
  OPCION_PREDICADO,
  OPCION_VARIABLE,
  SELECT_CONSTANTE,
  SELECT_PREDICADO,
  SELECT_VARIABLE,
} from '../../comun/estilos';
import {
  COMPARADORES,
  Comparacion,
  LETRAS_VARIABLES,
  formatearCondicion,
  formatearLlamada,
  esNumero,
} from '../modelos';
import { SelectorValor } from '../selector-valor/selector-valor';

interface Filtro {
  operador: string;
  valor: string;
}

@Component({
  selector: 'app-panel-consulta',
  templateUrl: './panel-consulta.html',
  imports: [Combobox, SelectorValor],
})
export class PanelConsulta {
  protected readonly kb = inject(ConocimientoService);

  protected readonly abierta = signal(false);
  protected readonly disponible = computed(() => this.kb.hechos().length > 0);

  protected readonly predicado = signal('');
  protected readonly argumentos = signal<string[]>([]);
  protected readonly filtros = signal<(Filtro | null)[]>([]);

  protected readonly resultados = signal<string[][] | null>(null);
  protected readonly variablesConsultadas = signal<string[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly estiloPredicado = SELECT_PREDICADO;
  protected readonly estiloComparador = SELECT_PREDICADO;
  protected readonly estiloExtender = BOTON_EXTENDER;

  protected readonly gruposComparador: GrupoCombo[] = [
    {
      titulo: null,
      opciones: COMPARADORES.map((c) => ({
        valor: c.simbolo,
        etiqueta: c.simbolo,
        nota: c.nombre,
        clase: OPCION_PREDICADO,
      })),
    },
  ];

  protected readonly gruposPredicado = computed<GrupoCombo[]>(() => [
    {
      titulo: null,
      opciones: this.kb.predicados().map((p) => ({
        valor: p,
        etiqueta: p,
        nota: `${this.kb.aridad(p)} términos`,
        clase: OPCION_PREDICADO,
      })),
    },
  ]);

  protected readonly gruposArgumento = computed<GrupoCombo[]>(() => {
    const grupos: GrupoCombo[] = [
      {
        titulo: null,
        opciones: [
          { valor: '', etiqueta: 'libre', nota: 'cualquier valor', clase: OPCION_VARIABLE },
        ],
      },
    ];

    const constantes = this.kb.constantes();
    if (constantes.length > 0) {
      grupos.push({
        titulo: 'Constantes',
        opciones: constantes.map((t) => ({ valor: t, etiqueta: t, clase: OPCION_CONSTANTE })),
      });
    }

    return grupos;
  });

  protected readonly etiquetaCrearArgumento = (texto: string): string | null =>
    esNumero(texto) ? `+ usar el número ${texto}` : null;

  private readonly consultaResuelta = computed(() => {
    let libre = 0;
    const variables: string[] = [];
    const condiciones: Comparacion[] = [];
    const filtros = this.filtros();

    const argumentos = this.argumentos().map((a, i) => {
      if (a !== '') {
        return a;
      }
      const letra = LETRAS_VARIABLES[libre++];
      variables.push(letra);
      const filtro = filtros[i];
      if (filtro) {
        condiciones.push({
          tipo: 'comparacion',
          izquierda: letra,
          operador: filtro.operador,
          derecha: filtro.valor,
          operacion: '',
          derecha2: '',
        });
      }
      return letra;
    });

    return { argumentos, variables, condiciones };
  });

  protected readonly consultaTexto = computed(() => {
    const { argumentos, condiciones } = this.consultaResuelta();
    const partes = [
      formatearLlamada(this.predicado(), argumentos),
      ...condiciones.map(formatearCondicion),
    ];
    return partes.join(' & ');
  });

  protected readonly filtrosCompletos = computed(() =>
    this.filtros().every((f) => f === null || (f.operador !== '' && f.valor !== '')),
  );

  protected estiloArgumento(valor: string): string {
    return valor === '' ? SELECT_VARIABLE : SELECT_CONSTANTE;
  }

  protected alternar(): void {
    this.abierta.update((abierta) => !abierta);
  }

  protected elegirPredicado(nombre: string): void {
    const aridad = this.kb.aridad(nombre);
    this.predicado.set(nombre);
    this.argumentos.set(Array(aridad).fill(''));
    this.filtros.set(Array(aridad).fill(null));
    this.resultados.set(null);
    this.error.set(null);
  }

  protected elegirArgumento(indice: number, valor: string): void {
    this.argumentos.update((argumentos) => argumentos.with(indice, valor));
    if (valor !== '') {
      this.filtros.update((filtros) => filtros.with(indice, null));
    }
    this.resultados.set(null);
  }

  protected filtro(indice: number): Filtro | null {
    return this.filtros()[indice] ?? null;
  }

  protected agregarFiltro(indice: number): void {
    this.filtros.update((filtros) => filtros.with(indice, { operador: '>', valor: '' }));
    this.resultados.set(null);
  }

  protected quitarFiltro(indice: number): void {
    this.filtros.update((filtros) => filtros.with(indice, null));
    this.resultados.set(null);
  }

  protected ponerFiltro(indice: number, campo: 'operador' | 'valor', valor: string): void {
    this.filtros.update((filtros) => {
      const filtro = filtros[indice];
      return filtro === null ? filtros : filtros.with(indice, { ...filtro, [campo]: valor });
    });
    this.resultados.set(null);
  }

  protected async consultar(): Promise<void> {
    this.error.set(null);
    const { argumentos, variables, condiciones } = this.consultaResuelta();
    try {
      const filas = await this.kb.consultar(this.predicado(), argumentos, condiciones);
      this.variablesConsultadas.set(variables);
      this.resultados.set(filas);
    } catch (e) {
      this.error.set(
        mensajeError(e, 'No se pudo consultar. Comprueba que el servidor está en marcha.'),
      );
    }
  }
}
