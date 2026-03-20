import { BehaviorSubject, Observable, finalize, zip } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiService } from '../services/api.service';
import { YesNoModalComponent } from '../shared/components/yes-no-modal/yes-no-modal.component';
import { Pagination, PatientModel, PatientRecordModel, PatientRecordViewGroup, SpecNoRecordDetails } from '../shared/interfaces/template';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'mds-form-loader',
  standalone: false,
  templateUrl: './form-loader.component.html',
  styleUrls: ['./form-loader.component.scss']
})
export class FormLoaderComponent implements OnInit {
  private readonly viewStorageKey = 'mds-record-view';

  constructor(public api: ApiService, public route: ActivatedRoute, private modalService: NgbModal, private notifSvc: ToastrService,
    private router: Router) { }

  searchString: BehaviorSubject<string> = new BehaviorSubject("");
  isAdmin = false;
  isSuperAdmin = false;
  isLoading = false;

  accessLevel = "user";
  patientRecords: PatientRecordModel[] = [];
  patientRecordFromSearch: PatientRecordModel[] = [];
  patientRecordViews: PatientRecordViewGroup[] = [
    {
      id: 'records',
      label: 'Patient Records',
      description: 'Browse all submitted records'
    },
    {
      id: 'mrNo',
      label: 'By MR No',
      description: 'Grouped by medical record number'
    },
    {
      id: 'patient',
      label: 'By Patient',
      description: 'Grouped by patient'
    }
  ];
  currentView: PatientRecordViewGroup['id'] = 'records';
  specNoGroups: SpecNoRecordDetails[] = [];
  patients: PatientModel[] = [];
  patientRecordsByPatientId: Record<string, PatientRecordModel[]> = {};
  expandedPatientIds: Set<string> = new Set();
  loadingPatientIds: Set<string> = new Set();
  isGroupedViewLoading = false;
  mrNoPagination = {
    currentPage: 1,
    offset: 0,
    size: 10
  };
  patientPagination = {
    currentPage: 1,
    offset: 0,
    size: 10
  };

  pagination = {
    currentPage: 1,
    offset: 0,
    size: 10,
    totalElements: 10,
    sortKeys: ["receivedDateTime", "collectionDateTime"],
    sortOrder: "desc"
  }

  searchPagination = {
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

    this.pagination.currentPage = 1;
    this.pagination.size = 10;

    this.searchPagination.currentPage = 1;
    this.searchPagination.size = 10;
    
    if(this.searchString.getValue().trim().length) {
      this.loadSearchRecords();
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

    const savedView = localStorage.getItem(this.viewStorageKey);
    if (savedView === 'records' || savedView === 'mrNo' || savedView === 'patient') {
      this.currentView = savedView;
    }

    this.searchString.subscribe((term => {
      if (this.currentView !== 'records') {
        return;
      }

      if(!term.length) {
        this.patientRecordFromSearch = [];
        this.searchPagination.currentPage = 1;
        this.searchPagination.size = 10;
        return;
      }
      
      this.api.searchRecords(0, 10, term, this.pagination.sortKeys, this.pagination.sortOrder).pipe(finalize(() => {
        this.isLoading = false;
      })).subscribe((searchResult: Pagination<PatientRecordModel>) => {
        this.patientRecordFromSearch = searchResult.content;

        this.searchPagination = {
          ...this.searchPagination,
          offset: this.searchPagination.currentPage * this.searchPagination.size,
          totalElements: searchResult.totalElements
        }

      });
    }));

    if (this.currentView === 'mrNo') {
      this.loadSpecNoGroups();
      return;
    }

    if (this.currentView === 'patient') {
      this.loadPatients();
      return;
    }

    this.loadRecords();
  }

  get sortColumns() {
    return [...this.pagination.sortKeys, (this.pagination.sortOrder || "desc")];
  }

  loadSearchRecords() {
    this.isLoading = true;

    this.api.searchRecords(this.searchPagination.currentPage -1, this.searchPagination.size, 
      this.searchString.getValue(), this.pagination.sortKeys, this.pagination.sortOrder).pipe(finalize(() => {
      this.isLoading = false;
    })).subscribe((searchResult: Pagination<PatientRecordModel>) => {
      this.patientRecordFromSearch = searchResult.content;

      this.searchPagination = {
        ...this.searchPagination,
        offset: this.searchPagination.currentPage * this.searchPagination.size,
        totalElements: searchResult.totalElements
      }

    });
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

  setView(viewId: PatientRecordViewGroup['id']) {
    if (this.currentView === viewId) {
      return;
    }

    this.currentView = viewId;
    localStorage.setItem(this.viewStorageKey, viewId);
    this.mrNoPagination.currentPage = 1;
    this.mrNoPagination.offset = 0;
    this.patientPagination.currentPage = 1;
    this.patientPagination.offset = 0;

    if (viewId === 'records') {
      if (this.searchString.getValue().trim().length) {
        this.loadSearchRecords();
        return;
      }

      this.loadRecords();
      return;
    }

    this.patientRecordFromSearch = [];

    if (viewId === 'mrNo' && !this.specNoGroups.length) {
      this.loadSpecNoGroups();
      return;
    }

    if (viewId === 'patient' && !this.patients.length) {
      this.loadPatients();
    }
  }

  loadSpecNoGroups() {
    this.isGroupedViewLoading = true;
    this.api.getRecordsBySpecNo().pipe(finalize(() => {
      this.isGroupedViewLoading = false;
    })).subscribe(groups => {
      this.specNoGroups = (groups || []).sort((a, b) => this.latestGroupTimestamp(b) - this.latestGroupTimestamp(a));
    });
  }

  loadPatients() {
    this.isGroupedViewLoading = true;
    this.api.getPatients().pipe(finalize(() => {
      this.isGroupedViewLoading = false;
    })).subscribe(patients => {
      this.patients = (patients || []).sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    });
  }

  togglePatientGroup(patient: PatientModel) {
    const patientId = String(patient.id || '');

    if (!patientId) {
      return;
    }

    if (this.expandedPatientIds.has(patientId)) {
      this.expandedPatientIds.delete(patientId);
      return;
    }

    this.expandedPatientIds.add(patientId);

    if (this.patientRecordsByPatientId[patientId]) {
      return;
    }

    this.loadingPatientIds.add(patientId);
    this.api.getRecordsByPatient(patientId, 0, 100, this.pagination.sortKeys, this.pagination.sortOrder)
      .pipe(finalize(() => {
        this.loadingPatientIds.delete(patientId);
      }))
      .subscribe(records => {
        this.patientRecordsByPatientId[patientId] = (records.content || [])
          .sort((a, b) => this.recordTimestamp(b) - this.recordTimestamp(a));
      });
  }

  isPatientExpanded(patient: PatientModel) {
    return this.expandedPatientIds.has(String(patient.id || ''));
  }

  isPatientLoading(patient: PatientModel) {
    return this.loadingPatientIds.has(String(patient.id || ''));
  }

  patientRecordsFor(patient: PatientModel) {
    return this.patientRecordsByPatientId[String(patient.id || '')] || [];
  }

  filteredSpecNoGroups() {
    const query = this.searchString.getValue().trim().toLowerCase();

    if (!query.length) {
      return this.specNoGroups;
    }

    return this.specNoGroups.filter(group =>
      group.specNo?.toLowerCase().includes(query) ||
      group.records.some(record =>
        record.patient?.name?.toLowerCase().includes(query) ||
        record.ordered?.toLowerCase().includes(query))
    );
  }

  paginatedSpecNoGroups() {
    this.mrNoPagination.offset = this.mrNoPagination.currentPage * this.mrNoPagination.size;
    const start = (this.mrNoPagination.currentPage - 1) * this.mrNoPagination.size;
    return this.filteredSpecNoGroups().slice(start, start + this.mrNoPagination.size);
  }

  filteredPatients() {
    const query = this.searchString.getValue().trim().toLowerCase();

    if (!query.length) {
      return this.patients;
    }

    return this.patients.filter(patient =>
      String(patient.id || '').toLowerCase().includes(query) ||
      patient.name?.toLowerCase().includes(query) ||
      patient.dateOfBirth?.toLowerCase().includes(query)
    );
  }

  paginatedPatients() {
    this.patientPagination.offset = this.patientPagination.currentPage * this.patientPagination.size;
    const start = (this.patientPagination.currentPage - 1) * this.patientPagination.size;
    return this.filteredPatients().slice(start, start + this.patientPagination.size);
  }

  get searchPlaceholder() {
    if (this.currentView === 'mrNo') {
      return 'Search MR No or record details';
    }

    if (this.currentView === 'patient') {
      return 'Search patient name or ID';
    }

    return 'Search Patient Record';
  }

  get currentViewOption() {
    return this.patientRecordViews.find(view => view.id === this.currentView) || this.patientRecordViews[0];
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
          this.patientRecordFromSearch = this.patientRecordFromSearch.filter(record => record.id !== form.id);
          this.specNoGroups = this.specNoGroups
            .map(group => ({
              ...group,
              records: group.records.filter(record => record.id !== form.id)
            }))
            .filter(group => group.records.length);
          Object.keys(this.patientRecordsByPatientId).forEach(patientId => {
            this.patientRecordsByPatientId[patientId] = this.patientRecordsByPatientId[patientId]
              .filter(record => record.id !== form.id);
          });
          this.notifSvc.success(`Successfully deleted ${form.id}`);
        })
      }
    });
  }

  onSearch(searchTerm: string): void {
    if (searchTerm.length && this.currentView === 'records') {
      this.isLoading = true;
    }

    this.mrNoPagination.currentPage = 1;
    this.mrNoPagination.offset = 0;
    this.patientPagination.currentPage = 1;
    this.patientPagination.offset = 0;

    this.searchString.next(searchTerm);
  }

  private latestGroupTimestamp(group: SpecNoRecordDetails) {
    return Math.max(...group.records.map(record => this.recordTimestamp(record)), 0);
  }

  private recordTimestamp(record: PatientRecordModel) {
    return Number(record.receivedDateTime || record.collectionDateTime || 0);
  }

  editRecord(data: PatientRecordModel) {
    this.router.navigate([data.id], {
      relativeTo: this.route
    });
  }
}
