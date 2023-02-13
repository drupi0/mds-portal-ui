import { TestBed } from '@angular/core/testing';

import { BreadcrumbEffectService } from './breadcrumb.effect.service';

describe('EffectService', () => {
  let service: BreadcrumbEffectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BreadcrumbEffectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
