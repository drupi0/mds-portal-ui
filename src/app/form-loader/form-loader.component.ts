import { Component, OnInit } from '@angular/core';
import { BreadcrumbEffectService } from '../services/effects/breadcrumb.effect.service';
import { FormwizardEffectService } from '../services/effects/formwizard.effect.service';
import { Pagination, PatientRecordModel } from '../shared/interfaces/template';


@Component({
  selector: 'mds-form-loader',
  templateUrl: './form-loader.component.html',
  styleUrls: ['./form-loader.component.scss']
})
export class FormLoaderComponent implements OnInit {
  constructor(public breadcrumbEffect: BreadcrumbEffectService, 
              public recordEffect: FormwizardEffectService) { }

  searchString = "";
  pagination: {
    current: number,
    pageSize: number,
    total: number
  } = {
    current: 0,
    pageSize: 10,
    total: 50
  }

  patientRecords: PatientRecordModel[] = [];
  patientRecordFromSearch: PatientRecordModel[] = [];

  ngOnInit(): void {
    this.recordEffect.getPatientRecords().subscribe((data: Pagination<PatientRecordModel>) => {
      if(data.content?.length) {
        console.log(data.content)
        this.patientRecords = data.content;
      }
    });
  }

  onSearch(searchTerm: string): void {
    this.searchString = searchTerm;
    this.recordEffect.searchPatientRecord(this.searchString).subscribe((searchResult: Pagination<PatientRecordModel>) => {
      if(searchResult.content?.length) {
        this.patientRecordFromSearch = searchResult.content;
      }
    })
  }
}
