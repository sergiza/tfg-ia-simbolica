import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { marked } from 'marked';
import { ConocimientoService } from '../pydatalog/conocimiento-service';
import { BibliotecaService, Entrada } from './biblioteca-service';

@Component({
  selector: 'app-biblioteca',
  templateUrl: './biblioteca.html',
  imports: [DatePipe],
  host: { class: 'min-h-0 flex-1 overflow-y-auto' },
})
export class Biblioteca {
  protected readonly biblioteca = inject(BibliotecaService);
  private readonly kb = inject(ConocimientoService);
  private readonly router = inject(Router);

  protected readonly abierta = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly descripcion = computed(() => {
    const clave = this.abierta();
    if (clave === null) {
      return '';
    }
    const entradas = [...this.biblioteca.ejemplos(), ...this.biblioteca.guardados()];
    const markdown = entradas.find((e) => this.clave(e) === clave)?.descripcion ?? '';
    return marked.parse(markdown, { async: false });
  });

  constructor() {
    this.biblioteca
      .cargarLista()
      .catch(() => this.error.set('No se pudo leer la biblioteca.'));
  }

  protected clave(entrada: Entrada): string {
    return `${entrada.fecha === undefined ? 'ejemplo' : 'guardado'}:${entrada.id}`;
  }

  protected alternar(entrada: Entrada): void {
    const clave = this.clave(entrada);
    this.abierta.update((actual) => (actual === clave ? null : clave));
  }

  protected async cargar(entrada: Entrada, esEjemplo: boolean): Promise<void> {
    if (!this.confirmarDescarte()) {
      return;
    }
    this.error.set(null);
    try {
      if (esEjemplo) {
        await this.biblioteca.cargarEjemplo(entrada.id);
      } else {
        await this.biblioteca.cargarGuardado(entrada.id);
      }
      this.router.navigate(['/pydatalog']);
    } catch {
      this.error.set('No se pudo cargar.');
    }
  }

  protected async borrar(entrada: Entrada): Promise<void> {
    if (!confirm(`¿Borrar «${entrada.nombre}»?`)) {
      return;
    }
    this.error.set(null);
    try {
      await this.biblioteca.borrar(entrada.id);
    } catch {
      this.error.set('No se pudo borrar.');
    }
  }

  private confirmarDescarte(): boolean {
    const vacia = this.kb.hechos().length === 0 && this.kb.reglas().length === 0;
    return vacia || confirm('Se sustituirá la base de conocimiento actual. ¿Continuar?');
  }
}
