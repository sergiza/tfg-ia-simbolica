import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
    }).compileComponents();
  });

  function crearApp() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return fixture;
  }

  it('debería mostrar el título en la navbar', () => {
    const compiled = crearApp().nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('DatalogVisual');
  });

  it('debería ofrecer las tres páginas en la navegación', () => {
    const compiled = crearApp().nativeElement as HTMLElement;
    const destinos = Array.from(compiled.querySelectorAll('nav a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(destinos).toEqual(['/', '/pydatalog', '/biblioteca']);
  });
});
