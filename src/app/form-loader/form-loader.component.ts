import { Component } from '@angular/core';
import { BreadcrumbEffectService } from '../services/effects/breadcrumb.effect.service';


@Component({
  selector: 'mds-form-loader',
  templateUrl: './form-loader.component.html',
  styleUrls: ['./form-loader.component.scss']
})
export class FormLoaderComponent {
  constructor(public effect: BreadcrumbEffectService) { }

  onSort(event: any) {

  }

  openFormWizard(formId?: string) {
    this.effect.openFormWizard(formId);
  }
}
