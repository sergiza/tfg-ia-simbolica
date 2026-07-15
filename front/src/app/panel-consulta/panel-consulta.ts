import { Component, computed, inject, signal } from '@angular/core';
import { ConocimientoService } from '../conocimiento-service';
import { SELECT_CONSTANTE, SELECT_PREDICADO, SELECT_VARIABLE } from '../estilos';
import { LETRAS_VARIABLES } from '../modelos';

@Component({
  selector: 'app-panel-consulta',
  templateUrl: './panel-consulta.html',
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

  protected estiloArgumento(valor: string): string {
    return valor === '' ? SELECT_VARIABLE : SELECT_CONSTANTE;
  }

  protected alternar(): void {
    this.abierta.update((abierta) => !abierta);
  }

  protected elegirPredicado(evento: Event): void {
    const nombre = (evento.target as HTMLSelectElement).value;
    this.predicado.set(nombre);
    this.argumentos.set(Array(this.kb.aridad(nombre)).fill(''));
    this.resultados.set(null);
    this.error.set(null);
  }

  protected elegirArgumento(indice: number, evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.argumentos.update((argumentos) => argumentos.with(indice, valor));
    this.resultados.set(null);
  }

  protected async consultar(): Promise<void> {
    this.error.set(null);
    let libre = 0;
    const variables: string[] = [];
    const args = this.argumentos().map((a) => {
      if (a !== '') {
        return a;
      }
      const letra = LETRAS_VARIABLES[libre++];
      variables.push(letra);
      return letra;
    });
    try {
      const filas = await this.kb.consultar(this.predicado(), args);
      this.variablesConsultadas.set(variables);
      this.resultados.set(filas);
    } catch {
      this.error.set('No se pudo consultar. Comprueba que el servidor está en marcha.');
    }
  }
}
