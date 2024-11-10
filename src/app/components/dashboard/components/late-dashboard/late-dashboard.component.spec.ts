import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LateDashboardComponent } from './late-dashboard.component';

describe('LateDashboardComponent', () => {
  let component: LateDashboardComponent;
  let fixture: ComponentFixture<LateDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LateDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LateDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
