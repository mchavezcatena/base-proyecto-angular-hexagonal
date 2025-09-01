import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleAssignmentModalComponent } from './role-assignment-modal.component';

describe('RoleAssignmentModalComponent', () => {
  let component: RoleAssignmentModalComponent;
  let fixture: ComponentFixture<RoleAssignmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleAssignmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleAssignmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
