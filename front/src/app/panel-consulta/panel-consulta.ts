import { Component, computed, inject, signal } from '@angular/core';
import { Combobox, GrupoCombo } from '../combobox/combobox';
import { ConocimientoService } from '../conocimiento-service';
import {
  OPCION_CONSTANTE,
  OPCION_PREDICADO,
  OPCION_VARIABLE,
  SELECT_CONSTANTE,
  SELECT_PREDICADO,
  SELECT_VARIABLE,
} from '../estilos';
import { LETRAS_VARIABLES } from '../modelos';

@Component({
  selector: 'app-panel-consulta',
  templateUrl: './panel-consulta.html',
  imports: [Combobox],
})
export class PanelConsulta {
  protected readonly kb = inject(ConocimientoService);

  protected readonly abierta = signal(false);
  protected readonly disponible = computed(() => this.kb.hechos().length > 0);

  protected readonly predicado = signal('');
  protected readonly argumentos = signal<string[]>([]);

  protected readonly resultados = signal<string[][] | null>(null);
  protected readonly variablesConsultadas = signal<string[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly estiloPredicado = SELECT_PREDICADO;

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

  protected readonly gruposArgumento = computed<GrupoCombo[]>(() => [
    {
      titulo: null,
      opciones: [
        { valor: '', etiqueta: 'libre', nota: 'cualquier valor', clase: OPCION_VARIABLE },
        ...this.kb.terminos().map((t) => ({ valor: t, etiqueta: t, clase: OPCION_CONSTANTE })),
      ],
    },
  ]);

  private readonly consultaResuelta = computed(() => {
    let libre = 0;
    const variables: string[] = [];
    const argumentos = this.argumentos().map((a) => {
      if (a !== '') {
        return a;
      }
      const letra = LETRAS_VARIABLES[libre++];
      variables.push(letra);
      return letra;
    });
    return { argumentos, variables };
  });

  protected readonly consultaTexto = computed(() => {
    const args = this.consultaResuelta().argumentos.map((a) =>
      LETRAS_VARIABLES.includes(a) ? a : `'${a}'`,
    );
    return `${this.predicado()}(${args.join(', ')})`;
  });

  protected estiloArgumento(valor: string): string {
    return valor === '' ? SELECT_VARIABLE : SELECT_CONSTANTE;
  }

  protected alternar(): void {
    this.abierta.update((abierta) => !abierta);
  }

  protected elegirPredicado(nombre: string): void {
    this.predicado.set(nombre);
    this.argumentos.set(Array(this.kb.aridad(nombre)).fill(''));
    this.resultados.set(null);
    this.error.set(null);
  }

  protected elegirArgumento(indice: number, valor: string): void {
    this.argumentos.update((argumentos) => argumentos.with(indice, valor));
    this.resultados.set(null);
  }

  protected async consultar(): Promise<void> {
    this.error.set(null);
    const { argumentos, variables } = this.consultaResuelta();
    try {
      const filas = await this.kb.consultar(this.predicado(), argumentos);
      this.variablesConsultadas.set(variables);
      this.resultados.set(filas);
    } catch {
      this.error.set('No se pudo consultar. Comprueba que el servidor está en marcha.');
    }
  }
}
