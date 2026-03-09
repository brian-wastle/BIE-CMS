import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulletEditorComponent } from './bullet-editor.component';

describe('BulletEditorComponent', () => {
  let component: BulletEditorComponent;
  let fixture: ComponentFixture<BulletEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulletEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulletEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
