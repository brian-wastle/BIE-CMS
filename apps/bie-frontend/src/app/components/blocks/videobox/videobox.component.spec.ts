import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoBoxComponent } from './videobox.component';

describe('VideoBoxComponent', () => {
  let component: VideoBoxComponent;
  let fixture: ComponentFixture<VideoBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
