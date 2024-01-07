import { BehaviorSubject, Observable, debounceTime, finalize, zip } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiService } from '../services/api.service';
import { YesNoModalComponent } from '../shared/components/yes-no-modal/yes-no-modal.component';
import { Pagination, PatientRecordModel } from '../shared/interfaces/template';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'mds-form-loader',
  templateUrl: './form-loader.component.html',
  styleUrls: ['./form-loader.component.scss']
})
export class FormLoaderComponent implements OnInit {
  constructor(public api: ApiService, public route: ActivatedRoute, private modalService: NgbModal, private notifSvc: ToastrService,
    private router: Router) { }

  searchString: BehaviorSubject<string> = new BehaviorSubject("");
  isAdmin = false;
  isSuperAdmin = false;
  isLoading = false;

  accessLevel = "user";
  patientRecords: PatientRecordModel[] = [];
  patientRecordFromSearch: PatientRecordModel[] = [];

  pagination = {
    currentPage: 1,
    offset: 0,
    size: 10,
    totalElements: 10,
    sortKeys: ["receivedDateTime", "collectionDateTime"],
    sortOrder: "desc"
  }

  saveSort(sortColumns: string[]) {
    const cols = sortColumns.filter(key => !key.startsWith("asc") && !key.startsWith("desc"));

    if(JSON.stringify(cols) === JSON.stringify(this.pagination.sortKeys) && sortColumns.find(key => key === this.pagination.sortOrder)) {
      return;
    }

    this.pagination.sortKeys = cols;

    if (sortColumns.find(key => key.startsWith("asc"))) {
      this.pagination.sortOrder = "asc"
    }

    if (sortColumns.find(key => key.startsWith("desc"))) {
      this.pagination.sortOrder = "desc"
    }

    if (this.searchString.getValue().trim().length) {
      this.searchString.next(this.searchString.getValue());
      return;
    }

    this.loadRecords();
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      const { isAdmin, isSuperAdmin } = data;

      zip((isAdmin as Observable<boolean>), (isSuperAdmin as Observable<boolean>)).subscribe(access => {
        const [isAdmin, isSuperAdmin] = access;

        if(isSuperAdmin) {
          this.accessLevel = "superAdmin";
          return;
        }

        if(isAdmin) {
          this.accessLevel = "admin";
        }

      });
    });

    const savedPagination = sessionStorage.getItem("pagination");
    if (savedPagination) {
      this.pagination = JSON.parse(savedPagination);
    }

    this.searchString.subscribe((term => {
      this.api.searchRecords(0, 10, term, this.pagination.sortKeys, this.pagination.sortOrder).pipe(finalize(() => {
        this.isLoading = false;
      })).subscribe((searchResult: Pagination<PatientRecordModel>) => {
        this.patientRecordFromSearch = searchResult.content;
      });
    }));

    this.loadRecords();
  }

  get sortColumns() {
    return [...this.pagination.sortKeys, (this.pagination.sortOrder || "desc")];
  }

  loadRecords() {
    this.isLoading = true;
    this.api.getRecords(this.pagination.currentPage - 1, this.pagination.size, this.pagination.sortKeys, this.pagination.sortOrder)
      .pipe(finalize(() => { this.isLoading = false; })).subscribe((data: Pagination<PatientRecordModel>) => {

        this.patientRecords = data.content || [];

        this.pagination = {
          ...this.pagination,
          offset: this.pagination.currentPage * this.pagination.size,
          totalElements: data.totalElements
        }

        sessionStorage.setItem("pagination", JSON.stringify(this.pagination));
      });
  }

  deleteRecord(form: PatientRecordModel) {
    const modalRef = this.modalService.open(YesNoModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = `Delete "${form.id}"?`
    modalRef.componentInstance.modalBody = `Are you sure you want to PERMANENTLY delete this record?`

    modalRef.closed.subscribe((response) => {
      if (response) {
        this.api.deleteRecord(form.id as string).subscribe(() => {
          this.patientRecords = this.patientRecords.filter(record => record.id !== form.id);
          this.notifSvc.success(`Successfully deleted ${form.id}`);
        })
      }
    });
  }

  onSearch(searchTerm: string): void {
    if (searchTerm.length) {
      this.isLoading = true;
    }

    this.searchString.next(searchTerm);
  }

  editRecord(data: PatientRecordModel) {
    this.router.navigate([data.id], {
      relativeTo: this.route
    });
  }
}
