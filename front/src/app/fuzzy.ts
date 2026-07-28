export interface Segmento {
  texto: string;
  resaltado: boolean;
}

export interface Coincidencia<T> {
  elemento: T;
  segmentos: Segmento[];
}

interface Encontrado<T> extends Coincidencia<T> {
  puntos: number;
  longitud: number;
}

function indicesDe(texto: string, consulta: string): number[] | null {
  const objetivo = texto.toLowerCase();
  const indices: number[] = [];
  let desde = 0;
  for (const letra of consulta.toLowerCase()) {
    const i = objetivo.indexOf(letra, desde);
    if (i === -1) {
      return null;
    }
    indices.push(i);
    desde = i + 1;
  }
  return indices;
}

function puntuar(indices: number[]): number {
  let puntos = indices[0] === 0 ? 12 : 0;
  for (let i = 1; i < indices.length; i++) {
    const salto = indices[i] - indices[i - 1];
    puntos += salto === 1 ? 6 : -salto;
  }
  return puntos;
}

function segmentar(texto: string, indices: number[]): Segmento[] {
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
  const buscado = consulta.trim();
  if (buscado === '') {
    return elementos.map((elemento) => ({
      elemento,
      segmentos: [{ texto: texto(elemento), resaltado: false }],
    }));
  }

  const encontrados: Encontrado<T>[] = [];
  for (const elemento of elementos) {
    const cadena = texto(elemento);
    const indices = indicesDe(cadena, buscado);
    if (indices !== null) {
      encontrados.push({
        elemento,
        segmentos: segmentar(cadena, indices),
        puntos: puntuar(indices),
        longitud: cadena.length,
      });
    }
  }

  encontrados.sort((a, b) => b.puntos - a.puntos || a.longitud - b.longitud);
  return encontrados.map(({ elemento, segmentos }) => ({ elemento, segmentos }));
}
