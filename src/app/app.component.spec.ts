import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'PokeTCGSky'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('PokeTCGSky');
  });

  it('should lock the viewport scaling to avoid the startup zoom', () => {
    const viewportMeta = document.head.querySelector('meta[name="viewport"]');
    const content = viewportMeta?.getAttribute('content') ?? '';

    expect(viewportMeta).not.toBeNull();
    expect(content).toContain('width=device-width');
    expect(content).toContain('initial-scale=1');
    expect(content).toContain('maximum-scale=1');
    expect(content).toContain('user-scalable=no');
    expect(content).not.toContain('minimum-scale');
  });
});
