import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConocimientoService } from '../pydatalog/conocimiento-service';
import { Estado } from '../pydatalog/modelos';

const API = 'http://localhost:5000';

export interface Entrada {
  id: string | number;
  nombre: string;
  descripcion: string;
  fecha?: string;
}

@Injectable({ providedIn: 'root' })
export class BibliotecaService {
  private readonly http = inject(HttpClient);
  private readonly kb = inject(ConocimientoService);

  readonly ejemplos = signal<Entrada[]>([]);
  readonly guardados = signal<Entrada[]>([]);

  async cargarLista(): Promise<void> {
    const lista = await firstValueFrom(
      this.http.get<{ ejemplos: Entrada[]; guardados: Entrada[] }>(`${API}/biblioteca`),
    );
    this.ejemplos.set(lista.ejemplos);
    this.guardados.set(lista.guardados);
  }

  async cargarEjemplo(id: string | number): Promise<void> {
    await this.aplicar(`${API}/biblioteca/ejemplos/${id}/cargar`);
  }

  async cargarGuardado(id: string | number): Promise<void> {
    await this.aplicar(`${API}/biblioteca/guardados/${id}/cargar`);
  }

  async guardar(nombre: string, descripcion: string): Promise<void> {
    await firstValueFrom(this.http.post(`${API}/biblioteca/guardados`, { nombre, descripcion }));
  }

  async borrar(id: string | number): Promise<void> {
    await firstValueFrom(this.http.delete(`${API}/biblioteca/guardados/${id}`));
    this.guardados.update((guardados) => guardados.filter((g) => g.id !== id));
  }

  private async aplicar(url: string): Promise<void> {
    const estado = await firstValueFrom(this.http.post<Estado>(url, {}));
    this.kb.reemplazar(estado);
  }
}
