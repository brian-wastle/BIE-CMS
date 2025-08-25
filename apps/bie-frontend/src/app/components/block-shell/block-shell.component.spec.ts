import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockShellComponent } from './block-shell.component';

describe('BlockShellComponent', () => {
  let component: BlockShellComponent;
  let fixture: ComponentFixture<BlockShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockShellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
