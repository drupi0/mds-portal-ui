import { TestBed } from '@angular/core/testing';

import { FormwizardEffectService } from './formwizard.effect.service';

describe('FormwizardEffectService', () => {
  let service: FormwizardEffectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormwizardEffectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
