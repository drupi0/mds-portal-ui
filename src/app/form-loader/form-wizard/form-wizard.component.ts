import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxNotificationService } from 'ngx-notification';
import { BehaviorSubject, catchError, EMPTY, forkJoin, map, of, switchMap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FormwizardEffectService } from 'src/app/services/effects/formwizard.effect.service';
import { FieldType } from 'src/app/shared/interfaces/form';
import { StaffModel, PatientModel, PatientRecordModel, TemplateModel } from 'src/app/shared/interfaces/template';
import { StaffModalComponent } from '../staff-modal/staff-modal.component';
import { TemplateModalComponent } from '../template-modal/template-modal.component';

@Component({
  selector: 'mds-form-wizard',
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.scss']
})
export class FormWizardComponent implements OnInit {
  
  defaultStaff: StaffModel = {
    name: "",
    id: "",
    licNo: ""
  }

  defaultForm = new FormGroup({
    id: new FormControl(),
    name: new FormControl(),
    age: new FormControl(),
    sex: new FormControl(),
    dateOfBirth: new FormControl(),
    specNo: new FormControl(),
    orderingDr: new FormControl(),
    status: new FormControl("routine"),
    specimen: new FormControl(),
    ordered: new FormControl(),
    collectionDateTime: new FormControl(this.todayDate as NgbDateStruct),
    receivedDateTime: new FormControl(this.todayDate as NgbDateStruct),
    comment: new FormControl(),
    performedBy: new FormControl<StaffModel>(this.defaultStaff),
    verifiedBy: new FormControl<StaffModel>(this.defaultStaff),
    pathologist: new FormControl<StaffModel>(this.defaultStaff)
  });

  
  templateOptions: BehaviorSubject<TemplateModel[]> = new BehaviorSubject([] as TemplateModel[]);
  templateList: BehaviorSubject<TemplateModel[]> = new BehaviorSubject([] as TemplateModel[]);
  patientList:  BehaviorSubject<PatientModel[]> = new BehaviorSubject([] as PatientModel[]);
  

  initFormBuilder() {
    this.api.getTemplates().subscribe((list: TemplateModel[]) => this.templateOptions.next(list));

    this.route.params.subscribe(param => {
      const { formId } = param;

      if (formId) {
        this.initFormTemplate(formId);
      }
    });
  }

  onPatientSearch(query: string) {
    this.api.searchPatient(query).subscribe(patients => this.patientList.next(patients));
  }


  ngOnInit() {
    this.initFormBuilder();
  }

  editTemplate(template: TemplateModel) {
    this.updateTemplate(template);
  }

  private updateTemplate(template: TemplateModel) {
    const modalRef = this.modalService.open(TemplateModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.componentInstance.template = JSON.parse(JSON.stringify(template));

    modalRef.closed.pipe(switchMap(({ data, isDeleted }: { data: TemplateModel, isDeleted: boolean }) => {
      if(isDeleted) {
        return forkJoin({ data: this.api.deleteTemplate(data), isDeleted: of(isDeleted) });
      }

      return forkJoin({ data: this.api.saveTemplate(data), isDeleted: of(isDeleted) });

    })).subscribe((returnValue) => {

      const { data, isDeleted } = returnValue as { data: TemplateModel, isDeleted: boolean };

      if(isDeleted) {
        this.showSuccessToast(`Template ${data.name} has been deleted`);
      }

      const tempOptions = this.templateOptions.getValue().filter(templateField => templateField.id !== data.id);
      const tempList = this.templateList.getValue().filter(templateItem => templateItem.id !== data.id);
  
      
      this.templateOptions.next([...tempOptions, ...(!isDeleted ? [data] : [])]);
      this.templateList.next([...tempList, ...(!isDeleted ? [data] : [])]);

    });
  }

  saveTemplate(template: TemplateModel, templateHtml: HTMLTableSectionElement) {
    template.group.forEach(group => group.values = []);

    Array.from(templateHtml.getElementsByTagName("tr")).forEach(row => {
      Array.from(row.getElementsByClassName("tbl-data")).forEach((data, index) => {
        const value = (data as HTMLInputElement).value;
        template.group[index].values.push(!value ? '' : value.trim());
      });
    });

    this.api.updateTemplate(template).pipe(catchError((err: Error) => {
      err.message = `Error saving '${template.name}'. Template might be outdated or has been deleted from the database.`
      this.showErrorToast(err);
      return EMPTY;
    })).subscribe(() => {
      const tempOptions = this.templateOptions.getValue();
      this.templateOptions.next([...tempOptions.filter(opt => opt.id !== template.id), template]);

      this.showSuccessToast(`Successfully updated '${ template.name }'`);
    });
  }

  dropdownClick(templateIndex: number, colIndex: number, rowIndex: number, value: string) {
    const templateListValues = this.templateList.getValue();
    templateListValues[templateIndex].group[colIndex].values.splice(rowIndex, 1, value);

    this.templateList.next(templateListValues);

  }

  saveForm() {
    // to implement how to get form values from table
    
    const formValue = this.defaultForm.getRawValue();
    const patientModel: PatientModel = {
      name: formValue.name,
      dateOfBirth: formValue.dateOfBirth,
      sex: formValue.sex,
    };

    const patientRecord: PatientRecordModel = {
      id: formValue.id,
      date: new Date().toDateString(),
      patient: patientModel,
      pathologist: formValue.pathologist as StaffModel,
      performedBy: formValue.performedBy as StaffModel,
      verifiedBy: formValue.verifiedBy as StaffModel,
      specNo: formValue.specNo,
      orderingDoctor: formValue.orderingDr,
      status: formValue.status,
      specimen: formValue.specimen,
      ordered: formValue.ordered,
      collectionDateTime: formValue.collectionDateTime,
      receivedDateTime: formValue.receivedDateTime,
      data: JSON.stringify(this.templateList.getValue()),
      comments: formValue.comment
    } as PatientRecordModel;

    const patientFormJson: {} = {
      ...patientRecord,
      collectionDateTime:  this.dateToString(patientRecord.collectionDateTime),
      receivedDateTime: this.dateToString(patientRecord.receivedDateTime),
      patient: {
        ...patientRecord.patient,
        dateOfBirth: this.dateToString(patientRecord.patient.dateOfBirth)
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

  clearForm() {
    this.defaultForm.reset();
    this.templateList.next([]);
  }

  printForm() {

  }

  newTemplate() {
    const modalRef = this.modalService.open(TemplateModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.closed.pipe(switchMap(({ data }: { data: TemplateModel }) => {
      return this.api.saveTemplate(data);
    })).subscribe((newTemplate: TemplateModel) => {
      this.showSuccessToast(`Template named '${newTemplate.name} has been saved.'`);
      this.templateOptions.next([...this.templateOptions.getValue(), newTemplate]);
    });
  }

  removeRow(template: TemplateModel, rowIndex: number) {
    template.group.forEach((group) => {
      if (group.values.length === 1) {
        return;
      }
      group.values.splice(rowIndex, 1);
    });
  }


  addToTemplateField(template: TemplateModel) {
    const tempList = this.templateList.getValue() || [];

    if (template.group[0].values.length === 0) {
      this.addRow(template);
    }

    console.log(tempList);

    tempList.push(template);

    this.templateList.next(tempList);
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

  removeFromTemplateField(templateIndex: number) {
    const tempList = this.templateList.getValue();
    tempList.splice(templateIndex, 1);
    this.templateList.next(tempList)
  }

  showStaffModal(control: FormControl) {
    const modalRef = this.modalService.open(StaffModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });
    
    modalRef.closed.subscribe(data => {
      if (data) {
        control.setValue(data);
      }
    })
  }

  dateBlur(event: any | NgbDateStruct, control: FormControl) {
   
    if(event instanceof FocusEvent ) {

      const dateValue = (event.target as HTMLInputElement).value
      control.setValue(this.formatDateStringToNgbDate(dateValue));
      return;
    }
  }

  assignPatient(patient: PatientModel) {
    this.defaultForm.controls.name.setValue(patient.name);

    if (Object.keys(patient.dateOfBirth).length) {
      this.defaultForm.controls.dateOfBirth.setValue(patient.dateOfBirth);
      this.defaultForm.controls.age.setValue(this.calcAge);
    }


    this.defaultForm.controls.sex.setValue(patient.sex);
  }

  get todayDate() {
    return this.calendar.getToday();
  }

  get calcAge() {
    if (!this.defaultForm.get('dateOfBirth')?.value) {
      return "";
    }

    const { year, month, day } = this.defaultForm.get('dateOfBirth')?.value;
    let age = this.todayDate.year - year
    const monthDiff = this.todayDate.month - month;
    if (monthDiff < 0 || (monthDiff === 0 && this.todayDate.day < day)) {
      age--;
    }

    return `${age}`;
  }

  private formatDateStringToNgbDate(date: string): NgbDateStruct {
    const splitDate = date.split("-");

    if(splitDate.length < 3) {
      return this.todayDate;
    }

    return {
      year: parseInt(splitDate[0]),
      month: parseInt(splitDate[1]),
      day: parseInt(splitDate[2])
    }
  }

  private dateToString(dateJson: NgbDateStruct) {
    return `${dateJson.year}-${dateJson.month}-${dateJson.day}`
  }


  private initFormTemplate(formId: string) {
    this.api.findRecord(formId).subscribe((patientRecord: any) => {
      const record: PatientRecordModel = {
        ...patientRecord,
        patient: {
          ...patientRecord?.patient,
          dateOfBirth: this.formatDateStringToNgbDate(patientRecord?.patient?.dateOfBirth)
        },
        receivedDateTime: this.formatDateStringToNgbDate(patientRecord?.receivedDateTime),
        collectionDateTime: this.formatDateStringToNgbDate(patientRecord?.collectionDateTime)
      } as PatientRecordModel;

      this.templateList.next(JSON.parse(record.data));

      const formValues = {
        id: record.id,
        name: record.patient.name,
        age: this.calcAge,
        sex: record.patient.sex,
        dateOfBirth: record.patient.dateOfBirth,
        specNo: record.specNo,
        orderingDr: record.orderingDoctor,
        status: record.status,
        specimen: record.specimen,
        ordered: record.ordered,
        collectionDateTime: record.collectionDateTime,
        receivedDateTime: record.receivedDateTime,
        comment: record.comments,
        performedBy: record.performedBy,
        verifiedBy: record.verifiedBy,
        pathologist: record.pathologist
    }

      this.defaultForm.setValue(formValues);

    })
  }

  private showErrorToast(err: Error) {
    this.notifSvc.sendMessage(err.message, 'danger', 'top-right');
  }

  private showSuccessToast(content: string) {
    this.notifSvc.sendMessage(content, 'success', 'top-right');
  }

  private showInfoToast(content: string) {
    this.notifSvc.sendMessage(content, 'info', 'top-right');
  }


  constructor(private route: ActivatedRoute, private modalService: NgbModal, 
              private calendar: NgbCalendar, private api: ApiService, 
              private notifSvc: NgxNotificationService, private ngZone: NgZone, private router: Router) { }
}
