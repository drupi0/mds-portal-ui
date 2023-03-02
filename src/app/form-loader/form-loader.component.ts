import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxNotificationService } from 'ngx-notification';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { YesNoModalComponent } from '../shared/components/yes-no-modal/yes-no-modal.component';
import { Pagination, PatientRecordModel } from '../shared/interfaces/template';


@Component({
  selector: 'mds-form-loader',
  templateUrl: './form-loader.component.html',
  styleUrls: ['./form-loader.component.scss']
})
export class FormLoaderComponent implements OnInit {
  constructor(public api: ApiService, public route: ActivatedRoute, private modalService: NgbModal, private notifSvc: NgxNotificationService) { }

  searchString = "";
  isAdmin = false;

  patientRecords: PatientRecordModel[] = [];
  patientRecordFromSearch: PatientRecordModel[] = [];

  pagination = {
    currentPage: 1,
    offset: 0,
    size: 10,
    totalElements: 10
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      const { isAdmin } = data;
      (isAdmin as Observable<boolean>).subscribe(access => this.isAdmin = access);
    });

    this.api.getRecords(this.pagination.offset, this.pagination.size).subscribe((data: Pagination<PatientRecordModel>) => {
      if(data.content?.length) {
        this.patientRecords = data.content || [];
      }
    });
  }

  deleteRecord(form: PatientRecordModel) {
    const modalRef = this.modalService.open(YesNoModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = `Delete "${ form.id }"?`
    modalRef.componentInstance.modalBody = `Are you sure you want to PERMANENTLY delete this record?`

    modalRef.closed.subscribe((response) => {
        if(response) {
          this.api.deleteRecord(form.id as string).subscribe(() => {
            this.patientRecords = this.patientRecords.filter(record => record.id !== form.id);
            this.notifSvc.sendMessage(`Successfully deleted ${form.id} from the staff list`, 'success', 'bottom-right');
          })
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
