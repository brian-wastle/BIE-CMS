import { TestBed } from '@angular/core/testing';

import { CanvasEditStateService } from '../../../../canvas-edit-state.service';

describe('CanvasEditStateService', () => {
  let service: CanvasEditStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasEditStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
