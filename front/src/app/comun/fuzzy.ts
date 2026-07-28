import fuzzysort from 'fuzzysort';

export interface Segmento {
  texto: string;
  resaltado: boolean;
}

export interface Coincidencia<T> {
  elemento: T;
  segmentos: Segmento[];
}

function segmentar(texto: string, indices: readonly number[]): Segmento[] {
  const segmentos: Segmento[] = [];
  let cursor = 0;

  for (let i = 0; i < indices.length; i++) {
    const inicio = indices[i];
    let fin = inicio + 1;
    while (i + 1 < indices.length && indices[i + 1] === fin) {
      fin++;
      i++;
    }
    if (inicio > cursor) {
      segmentos.push({ texto: texto.slice(cursor, inicio), resaltado: false });
    }
    segmentos.push({ texto: texto.slice(inicio, fin), resaltado: true });
    cursor = fin;
  }

  if (cursor < texto.length) {
    segmentos.push({ texto: texto.slice(cursor), resaltado: false });
  }
  return segmentos;
}

export function filtrar<T>(
  elementos: readonly T[],
  consulta: string,
  texto: (elemento: T) => string,
): Coincidencia<T>[] {
  const candidatos = elementos.map((elemento) => ({ elemento, clave: texto(elemento) }));
  const encontrados = fuzzysort.go(consulta.trim(), candidatos, { key: 'clave', all: true });

  return encontrados.map((encontrado) => ({
    elemento: encontrado.obj.elemento,
    segmentos: segmentar(encontrado.obj.clave, encontrado.indexes),
  }));
}
