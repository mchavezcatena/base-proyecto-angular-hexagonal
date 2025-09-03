import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, UrlSegmentGroup, convertToParamMap } from '@angular/router';
import { GlobalStateService } from '../../services/global.service';
import { signal } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { Location, LocationStrategy, APP_BASE_HREF } from '@angular/common';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let mockGlobalState: jasmine.SpyObj<GlobalStateService>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Mock de GlobalStateService
    mockGlobalState = jasmine.createSpyObj('GlobalStateService',
      [
        'setTheme',
        'toggleTheme',
        'updateSystemPreference',
        'themeLabel',
        'themeIcon',
        'getCurrentTheme',
        'getThemeIcon',
        'getThemeLabel'
      ],
      {
        currentTheme: signal('auto'),
        isDarkMode: signal(false),
        systemPrefersDark: signal(false),
        themeState: signal({
          currentTheme: 'auto',
          isDarkMode: false,
          systemPrefersDark: false
        })
      }
    );

    // Configurar valores de retorno para los métodos del tema
    mockGlobalState.themeLabel.and.returnValue('Automático');
    mockGlobalState.themeIcon.and.returnValue('🔄');
    mockGlobalState.getCurrentTheme.and.returnValue('auto');
    mockGlobalState.getThemeIcon.and.returnValue('🔄');
    mockGlobalState.getThemeLabel.and.returnValue('Automático');

    // Mock de Router
    mockRouter = jasmine.createSpyObj('Router',
      ['navigate', 'navigateByUrl', 'createUrlTree', 'serializeUrl', 'parseUrl', 'isActive'],
      {
        events: new BehaviorSubject(null).asObservable(),
        routerState: {
          snapshot: {
            root: {
              firstChild: null
            }
          }
        },
        url: '/',
        parseUrl: (url: string) => ({
          root: new UrlSegmentGroup([], {}),
          queryParams: {},
          fragment: null,
          queryParamMap: convertToParamMap({})
        })
      }
    );

    // Configurar comportamiento adicional del Router
    mockRouter.serializeUrl.and.callFake((url: any) => url ? '/some-url' : '');

    // Configurar comportamiento del Router
    mockRouter.createUrlTree.and.returnValue({
      root: new UrlSegmentGroup([], {}),
      queryParams: {},
      fragment: null,
      queryParamMap: convertToParamMap({})
    });

    // Mock de ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({}),
        queryParamMap: convertToParamMap({}),
        params: {},
        queryParams: {},
        url: [],
        data: {},
        fragment: null,
        outlet: '',
        component: null,
        routeConfig: null,
        title: undefined,
        root: new ActivatedRouteSnapshot,
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: []
      },
      paramMap: of(convertToParamMap({})),
      queryParamMap: of(convertToParamMap({})),
      params: of({}),
      queryParams: of({}),
      url: of([]),
      data: of({})
    };

    await TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        RouterTestingModule.withRoutes([
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: {} as any },
          { path: 'login', component: {} as any }
        ])
      ],
      providers: [
        { provide: GlobalStateService, useValue: mockGlobalState },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: APP_BASE_HREF, useValue: '/' },
        Location
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect theme state from GlobalStateService', () => {
    expect(component.currentTheme()).toBe('auto');
    expect(component.isDarkMode()).toBeFalse();
  });


  it('should render footer content correctly', () => {
    const footerElement = fixture.nativeElement.querySelector('.app-footer');
    expect(footerElement).toBeTruthy();

    // Verificar título
    const title = footerElement.querySelector('.footer-title');
    expect(title.textContent).toContain('Sistema de Gestión');

    // Verificar enlaces rápidos
    const links = footerElement.querySelectorAll('.footer-link');
    expect(links.length).toBe(4);
    expect(links[0].textContent).toContain('Inicio');
    expect(links[1].textContent).toContain('Usuarios');
    expect(links[2].textContent).toContain('Roles');
    expect(links[3].textContent).toContain('Asignar Roles');

    // Verificar año actual en el copyright
    const copyright = footerElement.querySelector('.copyright');
    expect(copyright.textContent).toContain(new Date().getFullYear().toString());
  });

  it('should have correct router links', () => {
    const links = fixture.nativeElement.querySelectorAll('.footer-link');
    expect(links[0].getAttribute('ng-reflect-router-link')).toBe('/home');
    expect(links[1].getAttribute('ng-reflect-router-link')).toBe('/users');
    expect(links[2].getAttribute('ng-reflect-router-link')).toBe('/roles');
    expect(links[3].getAttribute('ng-reflect-router-link')).toBe('/assign-roles');
  });

  it('should reflect theme state', () => {
    expect(component.isDarkMode()).toBeFalse();
    expect(component.currentTheme()).toBe('auto');

    // Simular cambio de tema
    (mockGlobalState.isDarkMode as any).set(true);
    (mockGlobalState.currentTheme as any).set('dark');
    fixture.detectChanges();

    expect(component.isDarkMode()).toBeTrue();
    expect(component.currentTheme()).toBe('dark');
  });
});
