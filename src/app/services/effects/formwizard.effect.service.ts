import { Injectable, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDate, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxNotificationService } from 'ngx-notification';
import { BehaviorSubject, catchError, EMPTY, filter, from, map, Observable, of, Subject, switchMap, take } from 'rxjs';
import { StaffModalComponent } from 'src/app/form-loader/staff-modal/staff-modal.component';
import { TemplateModalComponent } from 'src/app/form-loader/template-modal/template-modal.component';
import { FieldType } from 'src/app/shared/interfaces/form';
import { StaffModel, PatientRecordModel, TemplateModel, PatientModel } from 'src/app/shared/interfaces/template';
import { ApiService } from '../api.service';
import { StateService } from '../state.service';

@Injectable({
  providedIn: 'root'
})
export class FormwizardEffectService {

  templateSelection: BehaviorSubject<TemplateModel[]> = new BehaviorSubject([{
    name: "Complete Blood Count",
    id: "12345",
    group: [{
      name: "Analyte",
      type: FieldType.TEXT,
      defaults: "",
      values: []
    },
    {
      name: "Flag",
      type: FieldType.DROPDOWN,
      defaults: "Select Item,L,H",
      values: []
    },
    {
      name: "REF RANGE",
      type: FieldType.NUMBER,
      defaults: "0",
      values: []
    },
    {
      name: "DOB",
      type: FieldType.DATETIME,
      defaults: "2020-10-10",
      values: []
    }
    ]
  }] as TemplateModel[]);

  templateFields: BehaviorSubject<TemplateModel[]> = new BehaviorSubject([] as TemplateModel[]);

  staffList: BehaviorSubject<StaffModel[]> = new BehaviorSubject([{
    name: "Dr. Arnold Villamor, MD",
    licNo: "312696349281638912634982"
  },
  {
    name: "Dr. Maria Villamor, MD",
    licNo: "312696349281638912634985"
  },
  {
    name: "Dr. Obeñita Villamor, MD",
    licNo: "312696349281638912634987"
  }]);

  currentRecord: Subject<PatientRecordModel> = new Subject();

  patientList: BehaviorSubject<PatientModel[]> = new BehaviorSubject([
    {
      id: "63e9f0333d295b422b1b6004",
      name: "Cyrus Hiyas",
      sex: "male",
      dateOfBirth: {
        month: 4,
        day: 30,
        year: 1996
      }
    }] as PatientModel[])

  // formRecords: BehaviorSubject<PatientRecordModel> = new BehaviorSubject([{
    
  // }])=

  saveForm(patientForm: PatientRecordModel) {
    const patientFormJson = {
      ...patientForm,
      collectionDateTime:  this.dateToString(patientForm.collectionDateTime),
      receivedDateTime: this.dateToString(patientForm.receivedDateTime),
      patient: {
        ...patientForm.patient,
        dateOfBirth: this.dateToString(patientForm.patient.dateOfBirth)
      }
    }
   
    this.api.saveRecord(patientFormJson).pipe(catchError((err: Error) => {
      
      this.showErrorToast(err);

      return EMPTY;
    })).subscribe((record: PatientRecordModel) => {
      
      this.ngZone.run(() => {
        this.router.navigate(["form"]).then(() => {
          this.showSuccessToast(`Form ${record.id} successfully saved`);
        });
      });
    });
  }

  private dateToString(dateJson: NgbDateStruct) {
    return `${dateJson.year}-${dateJson.month}-${dateJson.day}`
  }


  initFormTemplate(formId: string) {
    this.api.findRecord(formId).subscribe((patientRecord: any) => {

      console.log(patientRecord);

      this.currentRecord.next({
        ...patientRecord,
        patient: {
          ...patientRecord?.patient,
          dateOfBirth: this.formatDateStringToNgbDate(patientRecord?.patient?.dateOfBirth)
        },
        receivedDateTime: this.formatDateStringToNgbDate(patientRecord?.receivedDateTime),
        collectionDateTime: this.formatDateStringToNgbDate(patientRecord?.collectionDateTime)
      } as PatientRecordModel);
    })
  }

  getFormTemplates() {
    return this.templateFields.asObservable();
    // return this.getFormRecords().pipe(switchMap(records => {
    //   const formRecord = records.find(record => record.id === formId);

    //   if(!formRecord) {
    //     return of([]);
    //   }



    //   return of(records.find(record => record.id === formId)?.results);
    // }));
  }

  addToTemplateField(template: TemplateModel) {
    const templateList = this.templateFields.getValue();

    if (template.group[0].values.length === 0) {
      this.addRow(template);
    }

    templateList.push(template);
    this.templateFields.next(templateList);
  }


  deleteTemplate(template: TemplateModel) {
    const modalRef = this.modalService.open(TemplateModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.componentInstance.template = JSON.parse(JSON.stringify(template));

    modalRef.closed.pipe(switchMap(({ data, isDeleted }: { data: TemplateModel, isDeleted: boolean }) => {
      if(isDeleted) {
        return this.api.deleteTemplate(data);
      }

      return EMPTY;

    })).subscribe((data: TemplateModel) => {

      const templateList = this.templateFields.getValue().filter(templateField => templateField.id !== data.id);
      const templateOptions = this.templateSelection.getValue().filter(templateItem => templateItem.id !== data.id);

      this.templateFields.next(templateList);
      this.templateSelection.next(templateOptions);

      // -- FOR UPDATE TEMPLATE --

      // const templateOptions = this.templateSelection.getValue().filter(templateItem => templateItem.id !== template.id);
      // templateOptions.unshift(data);
      // this.templateSelection.next(templateOptions);

      // this.templateFields.next(this.templateFields.getValue().filter(templateField => templateField.id !== template.id));


      // this.addToTemplateField(data);
    });
  }

  addRowByIndex(templateIndex: number) {
    this.addRow(this.templateFields.getValue()[templateIndex]);
  }

  addRow(template: TemplateModel) {
    template.group.forEach((group) => {
      switch (group.type) {
        case FieldType.DROPDOWN:
          group.values.push(group.defaults.split(",")[0]);
          break;
        default:
          group.values.push(group.defaults);
      }
    });
  }

  showStaffModal(): Observable<StaffModel> {
    const modalRef = this.modalService.open(StaffModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    return from(modalRef.closed);
  }  

  getPatientList(): Observable<PatientModel[]> {
    return this.patientList.asObservable();
  }

  // --- Staff API ----

  getStaffList(): Observable<StaffModel[]> {
    return this.api.getStaff();
    //  this.staffList.asObservable();
  }

  saveStaff(staff: StaffModel) {
    return this.api.saveStaff(staff);
  }

  deleteStaff(staff: StaffModel) {
    return this.api.deleteStaff(staff);
  }

  // -- Templates API ---

  saveTemplate(template: TemplateModel) {
    return this.api.saveTemplate(template);
  }

  getTemplateOptions(): Observable<TemplateModel[]> {
    return this.api.getTemplates();
  }

  updateTemplate(template: TemplateModel) {
    return this.api.updateTemplate(template);
  }

  // -- Patient Record ---

  getPatientRecords() {
    return this.api.getRecords({
      pageNumber: 0,
      pageSize: 10,
    });
  }

  searchPatientRecord(seachQuery: string) {
    return this.api.searchRecords({
      pageNumber: 0,
      pageSize: 10,
    }, seachQuery);
  }

  showErrorToast(err: Error) {
    this.notifSvc.sendMessage(err.message, 'danger', 'top-right');
  }

  showSuccessToast(content: string) {
    this.notifSvc.sendMessage(content, 'success', 'top-right');
  }

  showInfoToast(content: string) {
    this.notifSvc.sendMessage(content, 'info', 'top-right');
  }

  private formatDateStringToNgbDate(date: string): NgbDateStruct {
    const splitDate = date.split("-");

    return {
      year: parseInt(splitDate[0]),
      month: parseInt(splitDate[1]),
      day: parseInt(splitDate[2])
    }
  }

  constructor(private notifSvc: NgxNotificationService, 
              private store: StateService, private modalService: NgbModal, 
              private calendar: NgbCalendar, private api: ApiService,
              private router: Router,
              private ngZone: NgZone) { }
}
