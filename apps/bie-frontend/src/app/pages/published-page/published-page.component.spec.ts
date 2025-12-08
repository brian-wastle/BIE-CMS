import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublishedPageComponent } from './published-page.component';

describe('PublishedPageComponent', () => {
  let component: PublishedPageComponent;
  let fixture: ComponentFixture<PublishedPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublishedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
