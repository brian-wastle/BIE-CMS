import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogBylineComponent } from './blog-byline.component';

describe('BlogBylineComponent', () => {
  let component: BlogBylineComponent;
  let fixture: ComponentFixture<BlogBylineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogBylineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogBylineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
