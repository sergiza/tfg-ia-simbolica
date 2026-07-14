import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly pestana = signal<'hecho' | 'regla'>('hecho');

  protected readonly hechos = signal<unknown[]>([]);

  protected readonly consultaAbierta = signal(false);
  protected readonly consultaDisponible = computed(() => this.hechos().length > 0);
}
