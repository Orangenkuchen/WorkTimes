import { TestBed } from '@angular/core/testing';

import { TimeRepositoryService } from './time-repository.service';

describe('TimeRepositoryService', () => {
  let service: TimeRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
