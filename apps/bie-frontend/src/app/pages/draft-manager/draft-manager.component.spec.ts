import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftManagerComponent } from './draft-manager.component';

describe('CanvasComponent', () => {
  let component: DraftManagerComponent;
  let fixture: ComponentFixture<DraftManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
