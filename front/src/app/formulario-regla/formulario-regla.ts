import { Component, computed, inject, signal } from '@angular/core';
import { ConocimientoService } from '../conocimiento-service';
import { LETRAS_VARIABLES, Literal, PredicadoDeclarado } from '../modelos';
import { SelectorPredicado } from '../selector-predicado/selector-predicado';
import { SelectorValor } from '../selector-valor/selector-valor';

@Component({
  selector: 'app-formulario-regla',
  imports: [SelectorPredicado, SelectorValor],
  templateUrl: './formulario-regla.html',
})
export class FormularioRegla {
  protected readonly kb = inject(ConocimientoService);

  protected readonly predicado = signal('');
  protected readonly borradorCabeza = signal<PredicadoDeclarado | null>(null);
  protected readonly cuerpo = signal<Literal[]>([{ predicado: '', argumentos: [] }]);
  protected readonly error = signal<string | null>(null);

  protected readonly variablesCabeza = computed(() => {
    const aridad = this.borradorCabeza()?.aridad ?? this.kb.aridad(this.predicado());
    return LETRAS_VARIABLES.slice(0, aridad);
  });

  protected readonly variablesEnJuego = computed(() => {
    const usadas = new Set([
      ...this.variablesCabeza(),
      ...this.cuerpo().flatMap((lit) => lit.argumentos),
    ]);
    return LETRAS_VARIABLES.filter((letra) => usadas.has(letra));
  });

  protected readonly nuevaVariable = computed(
    () => LETRAS_VARIABLES.find((letra) => !this.variablesEnJuego().includes(letra)) ?? null,
  );

  protected readonly cabezaTexto = computed(() => {
    const borrador = this.borradorCabeza();
    const nombre = (borrador ? borrador.nombre : this.predicado()) || '¿?';
    const vars = this.variablesCabeza();
    return `${nombre}(${vars.length === 0 ? '¿?' : vars.join(', ')})`;
  });

  protected readonly camposCompletos = computed(
    () =>
      this.predicado() !== '' &&
      this.cuerpo().every(
        (lit) =>
          lit.predicado !== '' &&
          lit.argumentos.length > 0 &&
          lit.argumentos.every((a) => a !== ''),
      ),
  );

  protected readonly variablesSinUsar = computed(() => {
    const enCuerpo = new Set(this.cuerpo().flatMap((lit) => lit.argumentos));
    return this.variablesCabeza().filter((v) => !enCuerpo.has(v));
  });

  protected readonly valido = computed(
    () => this.camposCompletos() && this.variablesSinUsar().length === 0,
  );

  protected elegirPredicadoCabeza(nombre: string): void {
    this.predicado.set(nombre);
    this.error.set(null);
  }

  protected elegirPredicadoLiteral(indice: number, nombre: string): void {
    this.cuerpo.update((cuerpo) =>
      cuerpo.with(indice, {
        predicado: nombre,
        argumentos: Array(this.kb.aridad(nombre)).fill(''),
      }),
    );
  }

  protected ponerArgumento(literal: number, indice: number, valor: string): void {
    this.cuerpo.update((cuerpo) =>
      cuerpo.with(literal, {
        ...cuerpo[literal],
        argumentos: cuerpo[literal].argumentos.with(indice, valor),
      }),
    );
  }

  protected agregarLiteral(): void {
    this.cuerpo.update((cuerpo) => [...cuerpo, { predicado: '', argumentos: [] }]);
  }

  protected quitarLiteral(indice: number): void {
    this.cuerpo.update((cuerpo) => cuerpo.toSpliced(indice, 1));
  }

  protected async enviar(evento: Event): Promise<void> {
    evento.preventDefault();
    if (!this.valido()) {
      return;
    }
    this.error.set(null);
    try {
      await this.kb.addRegla({
        cabeza: { predicado: this.predicado(), variables: this.variablesCabeza() },
        cuerpo: this.cuerpo(),
      });
      this.predicado.set('');
      this.cuerpo.set([{ predicado: '', argumentos: [] }]);
    } catch {
      this.error.set('No se pudo añadir la regla. Comprueba que el servidor está en marcha.');
    }
  }
}
