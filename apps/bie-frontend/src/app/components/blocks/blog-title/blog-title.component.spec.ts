import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogTitleComponent } from './blog-title.component';

describe('BlogTitleComponent', () => {
  let component: BlogTitleComponent;
  let fixture: ComponentFixture<BlogTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
