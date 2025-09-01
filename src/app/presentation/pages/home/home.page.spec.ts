import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render welcome section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const welcomeSection = compiled.querySelector('.welcome-section');

    expect(welcomeSection).toBeTruthy();
    expect(welcomeSection?.querySelector('h1')?.textContent).toBe('¡Bienvenido al Sistema de Gestión!');
  });

  it('should render dashboard cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const dashboardCards = compiled.querySelectorAll('.dashboard-card');

    expect(dashboardCards.length).toBe(3);

    // Verificar títulos de las tarjetas
    const cardTitles = Array.from(dashboardCards).map(card =>
      card.querySelector('h3')?.textContent
    );

    expect(cardTitles).toContain('Gestión de Usuarios');
    expect(cardTitles).toContain('Gestión de Roles');
    expect(cardTitles).toContain('Asignar Roles');
  });

  it('should render info section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const infoSection = compiled.querySelector('.info-section');


    const listItems = infoSection?.querySelectorAll('li');
    expect(listItems?.length).toBe(4);
  });

  it('should have correct router links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const dashboardCards = compiled.querySelectorAll('.dashboard-card');

    expect(dashboardCards[0].getAttribute('ng-reflect-router-link')).toBe('/users');
    expect(dashboardCards[1].getAttribute('ng-reflect-router-link')).toBe('/roles');
    expect(dashboardCards[2].getAttribute('ng-reflect-router-link')).toBe('/assign-roles');
  });

  it('should have login link in welcome section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const loginLink = compiled.querySelector('.login-link');

    expect(loginLink).toBeTruthy();
    expect(loginLink?.getAttribute('ng-reflect-router-link')).toBe('/login');
  });
});
