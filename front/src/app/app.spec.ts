import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('debería mostrar el título en la navbar', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('IA Simbólica');
  });

  it('debería bloquear la consulta mientras no haya hechos', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const botones = Array.from(compiled.querySelectorAll('button'));
    const botonConsultar = botones.find((b) => b.textContent?.includes('Consultar'));
    expect(botonConsultar?.disabled).toBe(true);
  });
});
