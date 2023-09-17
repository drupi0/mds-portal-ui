import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, KeyValue } from '@angular/common';
import { PatientModel, PatientRecordModel } from 'src/app/shared/interfaces/template';

@Component({
  selector: 'mds-forms-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forms-table.component.html',
  styleUrls: ['./forms-table.component.scss']
})
export class FormsTableComponent {
  @Input()
  patientRecords: PatientRecordModel[] = [];

  @Output()
  onDelete: EventEmitter<PatientRecordModel> = new EventEmitter();

  @Output()
  onEdit: EventEmitter<PatientRecordModel> = new EventEmitter();

  @Output()
  onDuplicate: EventEmitter<PatientRecordModel> = new EventEmitter();

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


  patientRecordData(): PatientRecordModel[] {
   return this.patientRecords; 
  }

  getProp(data: PatientRecordModel, key: string) {
    const value = (data as any)[key];

    if(key === "patient") {
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

  duplicate(data: PatientRecordModel) {
    this.onDuplicate.emit(data);
  }
}
