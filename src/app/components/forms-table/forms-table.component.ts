import { CommonModule, KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { PatientModel, PatientRecordModel } from 'src/app/shared/interfaces/template';

@Component({
  selector: 'mds-forms-table',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, RouterModule, NgbPopoverModule],
  templateUrl: './forms-table.component.html',
  styleUrls: ['./forms-table.component.scss']
})
export class FormsTableComponent implements OnInit {
  @Input()
  accessLevel: string = "user";

  @Input()
  patientRecords: PatientRecordModel[] = [];

  @Output()
  onDelete: EventEmitter<PatientRecordModel> = new EventEmitter();

  @Output()
  onEdit: EventEmitter<PatientRecordModel> = new EventEmitter();

  @Output()
  onSort: EventEmitter<string[]> = new EventEmitter();

  @Input()
  sortColumns: string[] = [];

  sortColumns$: Set<string> = new Set();

  originalSortConfig: string[] = [];

  sortOptions: KeyValue<string, string>[] = [{
    key: "collectionDateTime",
    value: "Collection Datetime"
  },
  {
    key: "receivedDateTime",
    value: "Received Datetime"
  },
  {
    key: "specNo",
    value: "MR No."
  },
  {
    key: "ordered",
    value: "Ordered"
  }, {
    key: "specimen",
    value: "Specimen"
  }];


  columns: KeyValue<string, string>[] = [{
    key: "collectionDateTime",
    value: "Collection Datetime"
  },
  {
    key: "receivedDateTime",
    value: "Received Datetime"
  },
  {
    key: "id",
    value: "Form ID"
  },
  {
    key: "specNo",
    value: "MR No."
  },
  {
    key: "ordered",
    value: "Ordered"
  }, {
    key: "specimen",
    value: "Specimen"
  },
  {
    key: "patient",
    value: "Patient's Name"
  },
  {
    key: "status",
    value: "Status"
  },
  {
    key: "actions",
    value: "Actions"
  }];

  ngOnInit(): void {
    this.sortColumns$ = new Set(this.sortColumns);
    this.originalSortConfig = [...this.sortColumns];
  }

  patientRecordData(): PatientRecordModel[] {
    return this.patientRecords;
  }

  getProp(data: PatientRecordModel, key: string) {
    const value = (data as any)[key];

    if (key === "patient") {
      let patient: PatientModel = value;
      return `${patient.name}`;
    }

    return value;
  }

  delete(data: PatientRecordModel) {
    this.onDelete.emit(data);
  }

  edit(data: PatientRecordModel) {
    this.onEdit.emit(data);
  }

  keyPriority(key: string): number {
    return [...this.sortColumns$].filter(xkey => !xkey.startsWith("asc") && !xkey.startsWith("desc")).findIndex(xKey => xKey === key) + 1;
  }

  checkKey(key: string) {
    return this.sortColumns$.has(key);
  }

  updateSortKeys(key: string) {
    if (key.startsWith("clear")) {
      this.sortColumns$.clear();
      this.sortColumns$.add("receivedDateTime");
      this.sortColumns$.add("collectionDateTime");
      this.sortColumns$.add("desc");
      return;
    }

    if (this.sortColumns$.has(key)) {
      this.sortColumns$.delete(key);
      return;
    }

    if (this.sortColumns$.has("asc") && key.startsWith("desc")) {
      this.sortColumns$.delete("asc");
    }

    if (this.sortColumns$.has("desc") && key.startsWith("asc")) {
      this.sortColumns$.delete("desc");
    }

    this.sortColumns$.add(key);
  }

  saveSort() {
    this.onSort.next([...this.sortColumns$]);
  }

  cancelSort() {
    this.sortColumns$ = new Set(this.originalSortConfig);
    this.onSort.next([...this.originalSortConfig]);
  }

  get canDelete() {
    return this.accessLevel === "admin" || this.accessLevel === "superAdmin";
  }

  convertDate(timeMillisStr: string) {
    return timeMillisStr;
    // return new Date(parseFloat(timeMillisStr)).toISOString();
  }
}
