import { Component } from '@angular/core';

import { EffectService } from '../services/effect.service';

@Component({
  selector: 'mds-form-loader',
  templateUrl: './form-loader.component.html',
  styleUrls: ['./form-loader.component.scss']
})
export class FormLoaderComponent {
  constructor(public effect: EffectService) { }

  onSort(event: any) {

  }

  openFormWizard(formId?: string) {
    this.effect.openFormWizard(formId);
  }
}
