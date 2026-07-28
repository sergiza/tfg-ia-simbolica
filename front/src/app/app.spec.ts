import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Estado } from './modelos';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  async function crearApp(estado: Estado = { hechos: [], reglas: [] }) {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('http://localhost:5000/estado').flush(estado);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('debería mostrar el título en la navbar', async () => {
    const fixture = await crearApp();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('IA Simbólica');
  });

  it('debería bloquear la consulta mientras no haya hechos', async () => {
    const fixture = await crearApp();
    const compiled = fixture.nativeElement as HTMLElement;
    const botones = Array.from(compiled.querySelectorAll('button'));
    const botonConsultar = botones.find((b) => b.textContent?.includes('Consultar'));
    expect(botonConsultar?.disabled).toBe(true);
  });

  it('debería desbloquear la consulta cuando hay hechos', async () => {
    const fixture = await crearApp({
      hechos: [{ predicado: 'padre', terminos: ['juan', 'maria'] }],
      reglas: [],
    });
    const compiled = fixture.nativeElement as HTMLElement;
    const botones = Array.from(compiled.querySelectorAll('button'));
    const botonConsultar = botones.find((b) => b.textContent?.includes('Consultar'));
    expect(botonConsultar?.disabled).toBe(false);
  });

  it('debería pintar los hechos en la base de conocimiento', async () => {
    const fixture = await crearApp({
      hechos: [{ predicado: 'padre', terminos: ['juan', 'maria'] }],
      reglas: [],
    });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('padre');
    expect(compiled.textContent).toContain("('juan', 'maria')");
  });

  it('debería pintar los números de un hecho sin comillas', async () => {
    const fixture = await crearApp({
      hechos: [{ predicado: 'hoyo', terminos: ['3', '1'] }],
      reglas: [],
    });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('(3, 1)');
  });

  it('debería pintar una regla con negación y comparación', async () => {
    const fixture = await crearApp({
      hechos: [{ predicado: 'brisa', terminos: ['2', '1'] }],
      reglas: [
        {
          cabeza: { predicado: 'seguro', variables: ['X', 'Y'] },
          cuerpo: [
            { tipo: 'literal', predicado: 'brisa', argumentos: ['X', 'Y'], negado: false },
            { tipo: 'literal', predicado: 'hoyo', argumentos: ['X', 'Y'], negado: true },
            {
              tipo: 'comparacion',
              izquierda: 'X',
              operador: '<',
              derecha: 'Y',
              operacion: '+',
              derecha2: '1',
            },
          ],
        },
      ],
    });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      'seguro(X, Y) <= brisa(X, Y) & ~hoyo(X, Y) & (X < Y + 1)',
    );
  });
});
