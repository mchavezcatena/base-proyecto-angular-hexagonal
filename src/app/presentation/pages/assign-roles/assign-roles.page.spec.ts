import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignRolesPage } from './assign-roles.page';

describe('AssignRolesPage', () => {
  let component: AssignRolesPage;
  let fixture: ComponentFixture<AssignRolesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignRolesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignRolesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
