import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { COMBO_FILA, COMBO_GRUPO, COMBO_LISTA, OPCION_CREAR } from '../estilos';
import { Segmento, filtrar } from '../fuzzy';

export interface OpcionCombo {
  valor: string;
  etiqueta: string;
  nota?: string;
  clase?: string;
}

export interface GrupoCombo {
  titulo: string | null;
  opciones: OpcionCombo[];
}

interface FilaVista {
  opcion: OpcionCombo;
  segmentos: Segmento[];
  indice: number;
}

interface GrupoVista {
  titulo: string | null;
  filas: FilaVista[];
}

let contador = 0;

@Component({
  selector: 'app-combobox',
  templateUrl: './combobox.html',
  imports: [CdkOverlayOrigin, CdkConnectedOverlay],
})
export class Combobox {
  readonly valor = input('');
  readonly grupos = input.required<GrupoCombo[]>();
  readonly etiqueta = input('');
  readonly marcador = input('elige…');
  readonly estilo = input('');
  readonly ancho = input('w-40');
  readonly etiquetaCrear = input<((texto: string) => string | null) | null>(null);
  readonly cambio = output<string>();
  readonly crear = output<string>();

  protected readonly id = `combo-${contador++}`;
  protected readonly estiloLista = COMBO_LISTA;
  protected readonly estiloGrupo = COMBO_GRUPO;
  protected readonly estiloFila = COMBO_FILA;
  protected readonly estiloCrear = OPCION_CREAR;

  protected readonly abierto = signal(false);
  protected readonly consulta = signal('');
  protected readonly indiceActivo = signal(0);
  protected readonly anchoOrigen = signal(0);

  private readonly entrada = viewChild.required<ElementRef<HTMLInputElement>>('entrada');
  private readonly origen = viewChild.required('origen', { read: ElementRef });
  private readonly filas = viewChildren<ElementRef<HTMLElement>>('opcionFila');

  protected readonly vista = computed(() => {
    const consulta = this.consulta();
    const grupos: GrupoVista[] = [];
    const todas: FilaVista[] = [];

    for (const grupo of this.grupos()) {
      const filas: FilaVista[] = [];
      for (const c of filtrar(grupo.opciones, consulta, (o) => o.etiqueta)) {
        const fila = { opcion: c.elemento, segmentos: c.segmentos, indice: todas.length };
        todas.push(fila);
        filas.push(fila);
      }
      if (filas.length > 0) {
        grupos.push({ titulo: grupo.titulo, filas });
      }
    }

    const texto = consulta.trim();
    const existe = this.grupos().some((g) => g.opciones.some((o) => o.valor === texto));
    const etiquetaCrear = this.etiquetaCrear();
    const textoCrear = etiquetaCrear === null || existe ? null : etiquetaCrear(texto);
    const crear = textoCrear === null ? null : { indice: todas.length, texto: textoCrear };

    return { grupos, todas, crear, total: todas.length + (crear === null ? 0 : 1) };
  });

  protected readonly textoValor = computed(() => {
    const opcion = this.grupos()
      .flatMap((g) => g.opciones)
      .find((o) => o.valor === this.valor());
    return opcion?.etiqueta ?? this.valor();
  });

  constructor() {
    effect(() => {
      if (!this.abierto()) {
        return;
      }
      this.filas()[this.indiceActivo()]?.nativeElement.scrollIntoView({ block: 'nearest' });
    });
  }

  protected abrir(): void {
    if (this.abierto()) {
      return;
    }
    this.consulta.set('');
    this.anchoOrigen.set(this.origen().nativeElement.offsetWidth);
    this.abierto.set(true);
    this.indiceActivo.set(this.indiceDe(this.valor()));
  }

  protected cerrar(): void {
    this.abierto.set(false);
    this.consulta.set('');
  }

  protected alternar(): void {
    if (this.abierto()) {
      this.cerrar();
      return;
    }
    this.abrir();
    this.entrada().nativeElement.focus();
  }

  protected escribir(evento: Event): void {
    this.consulta.set((evento.target as HTMLInputElement).value);
    this.abierto.set(true);
    this.indiceActivo.set(0);
  }

  protected elegir(indice: number): void {
    const { todas, crear } = this.vista();

    if (crear !== null && crear.indice === indice) {
      const texto = this.consulta().trim();
      this.cerrar();
      this.crear.emit(texto);
      return;
    }

    const fila = todas[indice];
    if (fila !== undefined) {
      this.cerrar();
      this.cambio.emit(fila.opcion.valor);
    }
  }

  protected teclear(evento: KeyboardEvent): void {
    if (evento.key === 'Tab') {
      this.cerrar();
      return;
    }

    if (evento.key === 'Escape') {
      if (this.abierto()) {
        evento.preventDefault();
        this.cerrar();
      }
      return;
    }

    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      if (!this.abierto()) {
        this.abrir();
        return;
      }
      const total = this.vista().total;
      if (total === 0) {
        return;
      }
      const paso = evento.key === 'ArrowDown' ? 1 : total - 1;
      this.indiceActivo.update((i) => (i + paso) % total);
      return;
    }

    if (!this.abierto()) {
      return;
    }

    switch (evento.key) {
      case 'Home':
        evento.preventDefault();
        this.indiceActivo.set(0);
        return;
      case 'End':
        evento.preventDefault();
        this.indiceActivo.set(Math.max(0, this.vista().total - 1));
        return;
      case 'Enter':
        evento.preventDefault();
        this.elegir(this.indiceActivo());
        return;
    }
  }

  private indiceDe(valor: string): number {
    const indice = this.vista().todas.findIndex((f) => f.opcion.valor === valor);
    return indice === -1 ? 0 : indice;
  }
}
