export interface Hecho {
  predicado: string;
  terminos: string[];
}

export interface Literal {
  tipo: 'literal';
  predicado: string;
  argumentos: string[];
  negado: boolean;
}

export interface Comparacion {
  tipo: 'comparacion';
  izquierda: string;
  operador: string;
  derecha: string;
  operacion: string;
  derecha2: string;
}

export type Condicion = Literal | Comparacion;

export interface Regla {
  cabeza: { predicado: string; variables: string[] };
  cuerpo: Condicion[];
}

export interface Estado {
  hechos: Hecho[];
  reglas: Regla[];
}

export interface PredicadoDeclarado {
  nombre: string;
  aridad: number;
}

export interface Operador {
  simbolo: string;
  nombre: string;
}

export const LETRAS_VARIABLES = ['X', 'Y', 'Z', 'U', 'V', 'W'];

export const ARIDADES = [1, 2, 3, 4];

export const COMPARADORES: Operador[] = [
  { simbolo: '==', nombre: 'igual a' },
  { simbolo: '!=', nombre: 'distinto de' },
  { simbolo: '<', nombre: 'menor que' },
  { simbolo: '<=', nombre: 'menor o igual que' },
  { simbolo: '>', nombre: 'mayor que' },
  { simbolo: '>=', nombre: 'mayor o igual que' },
];

export const OPERACIONES: Operador[] = [
  { simbolo: '+', nombre: 'más' },
  { simbolo: '-', nombre: 'menos' },
  { simbolo: '*', nombre: 'por' },
  { simbolo: '//', nombre: 'entre (división entera)' },
];

const HUECO = '¿?';

export function esNombreValido(nombre: string): boolean {
  return /^\p{Ll}[\p{Ll}\p{N}_]*$/u.test(nombre);
}

export function esNumero(valor: string): boolean {
  return /^\d+$/.test(valor);
}

export function esConstanteValida(valor: string): boolean {
  return esNombreValido(valor) || esNumero(valor);
}

export function esVariable(valor: string): boolean {
  return LETRAS_VARIABLES.includes(valor);
}

export function esComparador(valor: string): boolean {
  return COMPARADORES.some((c) => c.simbolo === valor);
}

function termino(valor: string): string {
  if (valor === '') {
    return HUECO;
  }
  return esVariable(valor) || esNumero(valor) ? valor : `'${valor}'`;
}

export function variablesDe(condicion: Condicion): string[] {
  const valores =
    condicion.tipo === 'literal'
      ? condicion.argumentos
      : [condicion.izquierda, condicion.derecha, condicion.derecha2];
  return valores.filter(esVariable);
}

export function formatearTerminos(terminos: string[]): string {
  return terminos.length === 0 ? HUECO : terminos.map(termino).join(', ');
}

export function formatearLlamada(predicado: string, terminos: string[]): string {
  return `${predicado || HUECO}(${formatearTerminos(terminos)})`;
}

export function formatearCondicion(condicion: Condicion): string {
  if (condicion.tipo === 'comparacion') {
    const partes = [
      termino(condicion.izquierda),
      condicion.operador || HUECO,
      termino(condicion.derecha),
    ];
    if (condicion.operacion !== '') {
      partes.push(condicion.operacion, termino(condicion.derecha2));
    }
    return `(${partes.join(' ')})`;
  }
  const negacion = condicion.negado ? '~' : '';
  return negacion + formatearLlamada(condicion.predicado, condicion.argumentos);
}

export function formatearRegla(regla: Regla): string {
  const cabeza = formatearLlamada(regla.cabeza.predicado, regla.cabeza.variables);
  const cuerpo = regla.cuerpo.map(formatearCondicion).join(' & ');
  return `${cabeza} <= ${cuerpo || HUECO}`;
}
