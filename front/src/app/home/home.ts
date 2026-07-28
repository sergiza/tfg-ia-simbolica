import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConocimientoService } from '../pydatalog/conocimiento-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  host: { class: 'min-h-0 flex-1 overflow-y-auto' },
})
export class Home {
  private readonly kb = inject(ConocimientoService);
  private readonly router = inject(Router);

  protected async nuevaBase(): Promise<void> {
    const vacia = this.kb.hechos().length === 0 && this.kb.reglas().length === 0;
    if (!vacia && !confirm('Se vaciará la base de conocimiento actual. ¿Seguir?')) {
      return;
    }
    await this.kb.reiniciar();
    this.router.navigate(['/pydatalog']);
  }
}
