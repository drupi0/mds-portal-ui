import { Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BreadcrumbEffectService } from '../services/effects/breadcrumb.effect.service';
import { FormwizardEffectService } from '../services/effects/formwizard.effect.service';
import { PatientRecordModel } from '../shared/interfaces/template';


@Component({
  selector: 'mds-form-loader',
  templateUrl: './form-loader.component.html',
  styleUrls: ['./form-loader.component.scss']
})
export class FormLoaderComponent {
  constructor(public breadcrumbEffect: BreadcrumbEffectService, public recordEffect: FormwizardEffectService) { }

  searchString = "";
  pagination: {
    current: number,
    pageSize: number,
    total: number
  } = {
    current: 1,
    pageSize: 10,
    total: 50
  }

  onSort(event: any) {

  }

  getFormList(): Observable<PatientRecordModel[]> {
    return this.recordEffect.getFormRecords().pipe(map(formRecords => {
      return !this.searchString.length ? formRecords : formRecords.filter(record => record.id === this.searchString || record.patient.name.toLowerCase().includes(this.searchString))
    }))
  }
}
