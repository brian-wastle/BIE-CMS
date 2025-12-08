import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalRuleBlockComponent } from './horizontal-rule-block.component';

describe('BlogBylineComponent', () => {
  let component: HorizontalRuleBlockComponent;
  let fixture: ComponentFixture<HorizontalRuleBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalRuleBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizontalRuleBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
