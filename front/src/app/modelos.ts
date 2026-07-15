export interface Hecho {
  predicado: string;
  terminos: string[];
}

export interface Literal {
  predicado: string;
  argumentos: string[];
}

export interface Regla {
  cabeza: { predicado: string; variables: string[] };
  cuerpo: Literal[];
}

export interface Estado {
  hechos: Hecho[];
  reglas: Regla[];
}

export interface PredicadoDeclarado {
  nombre: string;
  aridad: number;
}

export const LETRAS_VARIABLES = ['X', 'Y', 'Z', 'U', 'V', 'W'];

export function esNombreValido(nombre: string): boolean {
  return /^\p{Ll}[\p{Ll}\p{N}_]*$/u.test(nombre);
}
