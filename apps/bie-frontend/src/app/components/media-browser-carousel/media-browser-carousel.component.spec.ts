import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaBrowserCarouselComponent } from './media-browser-carousel.component';

describe('MediaBrowserCarouselComponent', () => {
  let component: MediaBrowserCarouselComponent;
  let fixture: ComponentFixture<MediaBrowserCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaBrowserCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaBrowserCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
