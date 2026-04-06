import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlourlessCakeComponent } from './flourless-cake.component';

describe('FlourlessCakeComponent', () => {
  let component: FlourlessCakeComponent;
  let fixture: ComponentFixture<FlourlessCakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlourlessCakeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlourlessCakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
