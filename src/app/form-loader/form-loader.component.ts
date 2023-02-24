import { Component, OnInit } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../services/api.service';
import { BreadcrumbEffectService } from '../services/effects/breadcrumb.effect.service';
import { Pagination, PatientRecordModel } from '../shared/interfaces/template';


@Component({
  selector: 'mds-form-loader',
  templateUrl: './form-loader.component.html',
  styleUrls: ['./form-loader.component.scss']
})
export class FormLoaderComponent implements OnInit {
  constructor(public breadcrumbEffect: BreadcrumbEffectService, public api: ApiService) { }

  searchString = "";

  patientRecords: PatientRecordModel[] = [];
  patientRecordFromSearch: PatientRecordModel[] = [];

  pagination = {
    currentPage: 1,
    offset: 0,
    size: 10,
    totalElements: 10
  }

  ngOnInit(): void {
    this.api.getRecords(this.pagination.offset, this.pagination.size).subscribe((data: Pagination<PatientRecordModel>) => {
      if(data.content?.length) {
        this.patientRecords = data.content || [];
      }
    });
  }

  onSearch(searchTerm: string): void {
    this.searchString = searchTerm;
    this.api.searchRecords(this.pagination.offset, this.pagination.size, searchTerm).subscribe((searchResult: Pagination<PatientRecordModel>) => {
      if(searchResult.content?.length) {
        this.patientRecordFromSearch = searchResult.content;
      }
    })
  }
}
