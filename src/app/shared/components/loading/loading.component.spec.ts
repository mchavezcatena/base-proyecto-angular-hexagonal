import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingComponent } from './loading.component';
import { GlobalStateService } from '../../services/global.service';
import { BehaviorSubject } from 'rxjs';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;
  let globalStateService: jasmine.SpyObj<GlobalStateService>;
  let loadingSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    // Create a spy object for GlobalStateService
    loadingSubject = new BehaviorSubject<boolean>(false);
    const mockGlobalStateService = {
      globalLoading: jasmine.createSpy().and.returnValue(loadingSubject.asObservable())
    };

    await TestBed.configureTestingModule({
      imports: [LoadingComponent],
      providers: [
        { provide: GlobalStateService, useValue: mockGlobalStateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    globalStateService = TestBed.inject(GlobalStateService) as jasmine.SpyObj<GlobalStateService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading overlay when global loading is true', () => {
    // Set loading to true
    loadingSubject.next(true);
    fixture.detectChanges();

    // Check if the loading overlay is displayed
    const loadingOverlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(loadingOverlay).toBeTruthy();
  });



  it('should display loading text', () => {
    // Set loading to true
    loadingSubject.next(true);
    fixture.detectChanges();

    // Check if the loading text is displayed
    const loadingText = fixture.nativeElement.querySelector('.loading-text');
    expect(loadingText).toBeTruthy();
    expect(loadingText.textContent).toContain('Cargando...');
  });

  it('should have a spinner element', () => {
    // Set loading to true
    loadingSubject.next(true);
    fixture.detectChanges();

    // Check if the spinner is present
    const spinner = fixture.nativeElement.querySelector('.loading-spinner');
    expect(spinner).toBeTruthy();
  });
});