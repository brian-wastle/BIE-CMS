import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundBlockComponent } from './background-block.component';

describe('BackgroundBlockComponent', () => {
  let component: BackgroundBlockComponent;
  let fixture: ComponentFixture<BackgroundBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackgroundBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BackgroundBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
