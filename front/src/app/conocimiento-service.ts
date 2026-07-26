import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Estado, Hecho, PredicadoDeclarado, Regla } from './modelos';

const API = 'http://localhost:5000';

@Injectable({ providedIn: 'root' })
export class ConocimientoService {
  private readonly http = inject(HttpClient);

  readonly hechos = signal<Hecho[]>([]);
  readonly reglas = signal<Regla[]>([]);
  readonly errorConexion = signal(false);

  private readonly declarados = signal<PredicadoDeclarado[]>([]);
  private readonly constantesExtra = signal<string[]>([]);

  readonly predicados = computed(() => {
    const nombres = [
      ...this.hechos().map((h) => h.predicado),
      ...this.reglas().map((r) => r.cabeza.predicado),
    ];
    return [...new Set(nombres)].sort();
  });

  readonly vocabulario = computed(() => {
    const porNombre = new Map<string, number>();
    for (const d of this.declarados()) {
      porNombre.set(d.nombre, d.aridad);
    }
    for (const r of this.reglas()) {
      porNombre.set(r.cabeza.predicado, r.cabeza.variables.length);
    }
    for (const h of this.hechos()) {
      porNombre.set(h.predicado, h.terminos.length);
    }
    return [...porNombre.entries()]
      .map(([nombre, aridad]) => ({ nombre, aridad }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  readonly terminos = computed(() => {
    const todos = [...this.hechos().flatMap((h) => h.terminos), ...this.constantesExtra()];
    return [...new Set(todos)].sort();
  });

  constructor() {
    this.cargarEstado().catch(() => this.errorConexion.set(true));
  }

  aridad(predicado: string): number {
    return this.vocabulario().find((p) => p.nombre === predicado)?.aridad ?? 0;
  }

  declararPredicado(nombre: string, aridad: number): void {
    if (!this.vocabulario().some((p) => p.nombre === nombre)) {
      this.declarados.update((declarados) => [...declarados, { nombre, aridad }]);
    }
  }

  registrarConstante(nombre: string): void {
    if (!this.terminos().includes(nombre)) {
      this.constantesExtra.update((constantes) => [...constantes, nombre]);
    }
  }

  async cargarEstado(): Promise<void> {
    const estado = await firstValueFrom(this.http.get<Estado>(`${API}/estado`));
    this.hechos.set(estado.hechos);
    this.reglas.set(estado.reglas);
    this.errorConexion.set(false);
  }

  async addHecho(hecho: Hecho): Promise<void> {
    const creado = await firstValueFrom(this.http.post<Hecho>(`${API}/hechos`, hecho));
    this.hechos.update((hechos) => [...hechos, creado]);
  }

  async removeHecho(hecho: Hecho): Promise<void> {
    await firstValueFrom(this.http.delete(`${API}/hechos`, { body: hecho }));
    this.hechos.update((hechos) => {
      const i = hechos.findIndex(
        (h) =>
          h.predicado === hecho.predicado &&
          h.terminos.length === hecho.terminos.length &&
          h.terminos.every((t, j) => t === hecho.terminos[j]),
      );
      return i === -1 ? hechos : hechos.toSpliced(i, 1);
    });
  }

  async addRegla(regla: Regla): Promise<void> {
    const creada = await firstValueFrom(this.http.post<Regla>(`${API}/reglas`, regla));
    this.reglas.update((reglas) => [...reglas, creada]);
  }

  async reiniciar(): Promise<void> {
    await firstValueFrom(this.http.post(`${API}/reiniciar`, {}));
    this.hechos.set([]);
    this.reglas.set([]);
    this.declarados.set([]);
    this.constantesExtra.set([]);
  }

  async consultar(predicado: string, argumentos: string[]): Promise<string[][]> {
    return firstValueFrom(
      this.http.post<string[][]>(`${API}/consultar`, { predicado, argumentos }),
    );
  }
}
