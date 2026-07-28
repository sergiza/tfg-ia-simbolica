import { Component, computed, inject, signal } from '@angular/core';
import { Combobox, GrupoCombo } from '../../comun/combobox/combobox';
import { ConocimientoService } from '../conocimiento-service';
import {
  BOTON_EXTENDER,
  OPCION_NEUTRA,
  OPCION_OPERACION,
  OPCION_PREDICADO,
  SELECT_OPERACION,
  SELECT_PREDICADO,
} from '../../comun/estilos';
import {
  COMPARADORES,
  Comparacion,
  Condicion,
  LETRAS_VARIABLES,
  Literal,
  OPERACIONES,
  PredicadoDeclarado,
  formatearLlamada,
  formatearRegla,
  variablesDe,
} from '../modelos';
import { SelectorPredicado } from '../selector-predicado/selector-predicado';
import { SelectorValor } from '../selector-valor/selector-valor';

type CampoComparacion = 'izquierda' | 'operador' | 'derecha' | 'operacion' | 'derecha2';

function literalVacio(): Literal {
  return { tipo: 'literal', predicado: '', argumentos: [], negado: false };
}

function comparacionVacia(operador: string): Comparacion {
  return { tipo: 'comparacion', izquierda: '', operador, derecha: '', operacion: '', derecha2: '' };
}

function condicionCompleta(condicion: Condicion): boolean {
  if (condicion.tipo === 'comparacion') {
    return (
      condicion.izquierda !== '' &&
      condicion.operador !== '' &&
      condicion.derecha !== '' &&
      (condicion.operacion === '' || condicion.derecha2 !== '')
    );
  }
  return (
    condicion.predicado !== '' &&
    condicion.argumentos.length > 0 &&
    condicion.argumentos.every((a) => a !== '')
  );
}

@Component({
  selector: 'app-formulario-regla',
  imports: [SelectorPredicado, SelectorValor, Combobox],
  templateUrl: './formulario-regla.html',
})
export class FormularioRegla {
  protected readonly kb = inject(ConocimientoService);

  protected readonly predicado = signal('');
  protected readonly borradorCabeza = signal<PredicadoDeclarado | null>(null);
  protected readonly cuerpo = signal<Condicion[]>([literalVacio()]);
  protected readonly error = signal<string | null>(null);

  protected readonly estiloComparador = SELECT_PREDICADO;
  protected readonly estiloOperacion = SELECT_OPERACION;
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

  protected readonly gruposOperacion: GrupoCombo[] = [
    {
      titulo: null,
      opciones: [
        { valor: '', etiqueta: 'ninguna', clase: OPCION_NEUTRA },
        ...OPERACIONES.map((o) => ({
          valor: o.simbolo,
          etiqueta: o.simbolo,
          nota: o.nombre,
          clase: OPCION_OPERACION,
        })),
      ],
    },
  ];

  protected readonly variablesCabeza = computed(() => {
    const aridad = this.borradorCabeza()?.aridad ?? this.kb.aridad(this.predicado());
    return LETRAS_VARIABLES.slice(0, aridad);
  });

  protected readonly variablesEnJuego = computed(() => {
    const usadas = new Set([...this.variablesCabeza(), ...this.cuerpo().flatMap(variablesDe)]);
    return LETRAS_VARIABLES.filter((letra) => usadas.has(letra));
  });

  protected readonly nuevaVariable = computed(
    () => LETRAS_VARIABLES.find((letra) => !this.variablesEnJuego().includes(letra)) ?? null,
  );

  private readonly variablesLigadas = computed(() => {
    const ligadas = this.cuerpo()
      .filter((c): c is Literal => c.tipo === 'literal' && !c.negado)
      .flatMap(variablesDe);
    return new Set(ligadas);
  });

  private readonly nombreCabeza = computed(() => this.borradorCabeza()?.nombre || this.predicado());

  protected readonly cabezaTexto = computed(() =>
    formatearLlamada(this.nombreCabeza(), this.variablesCabeza()),
  );

  protected readonly reglaTexto = computed(() =>
    formatearRegla({
      cabeza: { predicado: this.nombreCabeza(), variables: this.variablesCabeza() },
      cuerpo: this.cuerpo(),
    }),
  );

  protected readonly camposCompletos = computed(
    () => this.predicado() !== '' && this.cuerpo().every(condicionCompleta),
  );

  protected readonly variablesCabezaSinLigar = computed(() =>
    this.variablesCabeza().filter((v) => !this.variablesLigadas().has(v)),
  );

  protected readonly variablesCuerpoSinLigar = computed(() => {
    const ligadas = this.variablesLigadas();
    const sueltas = this.cuerpo()
      .filter((c) => c.tipo === 'comparacion' || c.negado)
      .flatMap(variablesDe)
      .filter((v) => !ligadas.has(v));
    return [...new Set(sueltas)];
  });

  protected readonly valido = computed(
    () =>
      this.camposCompletos() &&
      this.variablesCabezaSinLigar().length === 0 &&
      this.variablesCuerpoSinLigar().length === 0,
  );

  protected elegirPredicadoCabeza(nombre: string): void {
    this.predicado.set(nombre);
    this.error.set(null);
  }

  protected elegirPredicadoLiteral(indice: number, nombre: string): void {
    this.cuerpo.update((cuerpo) => {
      const previa = cuerpo[indice];
      return cuerpo.with(indice, {
        tipo: 'literal',
        predicado: nombre,
        argumentos: Array(this.kb.aridad(nombre)).fill(''),
        negado: previa.tipo === 'literal' && previa.negado,
      });
    });
  }

  protected elegirComparador(indice: number, operador: string): void {
    this.cuerpo.update((cuerpo) => cuerpo.with(indice, comparacionVacia(operador)));
  }

  protected alternarNegado(indice: number): void {
    this.cuerpo.update((cuerpo) => {
      const condicion = cuerpo[indice];
      if (condicion.tipo !== 'literal') {
        return cuerpo;
      }
      return cuerpo.with(indice, { ...condicion, negado: !condicion.negado });
    });
  }

  protected ponerArgumento(indice: number, posicion: number, valor: string): void {
    this.cuerpo.update((cuerpo) => {
      const condicion = cuerpo[indice];
      if (condicion.tipo !== 'literal') {
        return cuerpo;
      }
      return cuerpo.with(indice, {
        ...condicion,
        argumentos: condicion.argumentos.with(posicion, valor),
      });
    });
  }

  protected ponerCampo(indice: number, campo: CampoComparacion, valor: string): void {
    this.cuerpo.update((cuerpo) => {
      const condicion = cuerpo[indice];
      if (condicion.tipo !== 'comparacion') {
        return cuerpo;
      }
      const actualizada = { ...condicion, [campo]: valor };
      if (campo === 'operacion' && valor === '') {
        actualizada.derecha2 = '';
      }
      return cuerpo.with(indice, actualizada);
    });
  }

  protected agregarCondicion(): void {
    this.cuerpo.update((cuerpo) => [...cuerpo, literalVacio()]);
  }

  protected quitarCondicion(indice: number): void {
    this.cuerpo.update((cuerpo) =>
      cuerpo.length === 1 ? [literalVacio()] : cuerpo.toSpliced(indice, 1),
    );
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
      this.cuerpo.set([literalVacio()]);
    } catch {
      this.error.set('No se pudo añadir la regla. Comprueba que el servidor está en marcha.');
    }
  }
}
