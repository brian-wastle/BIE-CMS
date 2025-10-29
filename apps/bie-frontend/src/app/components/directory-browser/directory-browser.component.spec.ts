import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryBrowserComponent } from './directory-browser.component';

describe('DirectoryBrowserComponent', () => {
  let component: DirectoryBrowserComponent;
  let fixture: ComponentFixture<DirectoryBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectoryBrowserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectoryBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
