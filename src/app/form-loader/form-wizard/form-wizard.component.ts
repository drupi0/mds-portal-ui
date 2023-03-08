import { NgxNotificationService } from 'ngx-notification';
import {
  BehaviorSubject, catchError, debounceTime, EMPTY, forkJoin, interval, Observable, of, switchMap, take
} from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FieldType } from 'src/app/shared/interfaces/form';
import {
  PatientModel, PatientRecordModel, StaffModel, TemplateGroup, TemplateModel
} from 'src/app/shared/interfaces/template';

import { AfterViewChecked, ChangeDetectorRef, Component, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PrintformComponent } from '../printform/printform.component';
import { StaffModalComponent } from '../staff-modal/staff-modal.component';
import { TemplateModalComponent } from '../template-modal/template-modal.component';

@Component({
  selector: 'mds-form-wizard',
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.scss']
})
export class FormWizardComponent implements OnInit, AfterViewChecked {

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
    collectionDateTime: new FormControl(),
    receivedDateTime: new FormControl(),
    comment: new FormControl(),
    performedBy: new FormControl<StaffModel>(this.defaultStaff),
    verifiedBy: new FormControl<StaffModel>(this.defaultStaff),
    pathologist: new FormControl<StaffModel>(this.defaultStaff)
  });


  templateOptions: BehaviorSubject<TemplateModel[]> = new BehaviorSubject([] as TemplateModel[]);
  templateList: BehaviorSubject<TemplateModel[]> = new BehaviorSubject([] as TemplateModel[]);
  patientList: BehaviorSubject<PatientModel[]> = new BehaviorSubject([] as PatientModel[]);
  patientFormId: string = "";
  isAdmin = false;

  initFormBuilder() {
    this.api.getTemplates().subscribe((list: TemplateModel[]) => {
      this.templateOptions.next(list)
    });

    this.route.params.subscribe(param => {
      const { formId } = param;

      if (formId) {
        this.patientFormId = formId;
        this.initFormTemplate(formId);
      }
    });
  }

  onPatientSearch(query: string) {
    if (query.length < 3) {
      this.patientList.next([]);
      return;
    }

    this.api.searchPatient(query.trim().toLowerCase()).pipe(take(1), debounceTime(3000)).subscribe(patients => this.patientList.next(patients));
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }


  ngOnInit() {
    this.route.data.subscribe(data => {
      const { isAdmin } = data;
      (isAdmin as Observable<boolean>).subscribe(access => this.isAdmin = access);
    });

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
      if (isDeleted) {
        return forkJoin({ data: this.api.deleteTemplate(data), isDeleted: of(isDeleted) });
      }

      return forkJoin({ data: this.api.saveTemplate(data), isDeleted: of(isDeleted) });

    })).subscribe((returnValue) => {

      const { data, isDeleted } = returnValue as { data: TemplateModel, isDeleted: boolean };

      if (isDeleted) {
        this.showSuccessToast(`Template ${data.name} has been deleted`);
      }

      const tempOptions = this.templateOptions.getValue().filter(templateField => templateField.id !== data.id);
      const tempList = this.templateList.getValue().filter(templateItem => templateItem.id !== data.id);


      this.templateOptions.next([...tempOptions, ...(!isDeleted ? [data] : [])]);
      this.templateList.next([...tempList, ...(!isDeleted ? [data] : [])]);

    });
  }

  onDtChange(template: TemplateModel, groupId: string, row: number, event: string) {
    const groupIndex = template.group.findIndex(group => group.id === groupId);
    if(groupIndex !== -1) {
      template.group[groupIndex].values[row] = event;
    }
  }

  saveTemplate(template: TemplateModel, templateHtml: HTMLTableSectionElement) {
    const updateTemplate: TemplateModel = JSON.parse(JSON.stringify(template));
    updateTemplate.group.forEach(group => group.values = []);

    Array.from(templateHtml.getElementsByTagName("tr")).forEach(row => {
      Array.from(row.getElementsByClassName("tbl-data")).forEach((data) => {
        const { id, value } = (data as HTMLInputElement);
        const itemIndex = updateTemplate.group.findIndex(data => data.id === id.split(":")[0])

        if(itemIndex != -1) {
          updateTemplate.group[itemIndex].values.push(!value ? '' : value.trim());
        }
      });
    });

    this.api.updateTemplate(updateTemplate).pipe(catchError((err: Error) => {
      err.message = `Error saving '${template.name}'. Template might be outdated or has been deleted from the database.`
      this.showErrorToast(err);
      return EMPTY;
    })).subscribe((updatedTempResponse: TemplateModel) => {
      const tempOptions: TemplateModel[] = JSON.parse(JSON.stringify(this.templateOptions.getValue()));
      const toUpdateIndex = tempOptions.findIndex(opt => opt.id === updatedTempResponse.id);
      tempOptions.splice(toUpdateIndex, 1, updatedTempResponse);
      this.templateOptions.next(tempOptions);
      this.showSuccessToast(`Successfully updated '${updatedTempResponse.name}'`);

    });
  }

  dropdownClick(templateIndex: number, colIndex: number, rowIndex: number, value: string) {
    const templateListValues = this.templateList.getValue();
    templateListValues[templateIndex].group[colIndex].values.splice(rowIndex, 1, value);

    this.templateList.next(templateListValues);

  }

  private prepareRecord(): Partial<PatientRecordModel> {
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
      pathologist: !formValue.pathologist || !formValue.pathologist.name.trim().length ? null : formValue.pathologist as StaffModel,
      performedBy: !formValue.performedBy || !formValue.performedBy.name.trim().length ? null : formValue.performedBy as StaffModel,
      verifiedBy: !formValue.verifiedBy || !formValue.verifiedBy.name.trim().length ? null : formValue.verifiedBy as StaffModel,
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
      ...patientRecord
    }

    return patientFormJson;
  }

  get saveDisabled(): boolean {
    return document.getElementsByClassName("error").length !== 0;
  }

  isErrorColumn(group: { values: [] }): boolean {
    return group.values.some(val => !val);
  }

  inputChange(templateIndex: number, rowIndex: number, colIndex: number, target: any) {
    const inputValue = (target as HTMLInputElement).value

    const tempList = this.templateList.getValue();
    tempList[templateIndex].group[colIndex].values[rowIndex] = inputValue;

    this.templateList.next(tempList);
  }

  saveForm(navigateToHome: boolean = true) {
    this.api.saveRecord(this.prepareRecord()).pipe(catchError((err: Error) => {
      this.showErrorToast(err);
      return EMPTY;
    })).subscribe((record: PatientRecordModel) => {

      this.defaultForm.controls.id.setValue(record.id);

      if (navigateToHome) {
        this.ngZone.run(() => {
          this.router.navigate(["form"]).then(() => {
            this.showSuccessToast(`Form ${record.id} successfully saved`);
          });
        });
      } else {
        this.showSuccessToast(`Form ${record.id} successfully saved`);
      }
    });
  }

  clearForm() {
    this.defaultForm.reset();
    this.templateList.next([]);
  }

  printForm() {
    const modalRef = this.modalService.open(PrintformComponent, {
      fullscreen: true,
      backdrop: 'static'
    });

    this.saveForm(false);

    modalRef.componentInstance.formData = this.prepareRecord();
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
    const newTemplate = JSON.parse(JSON.stringify(template));

    if (template.group[0].values.join(",").trim().length === 0) {
      this.addRow(newTemplate, template.group[0].values.length - 1);
    }

    tempList.push(newTemplate);
    this.templateList.next(tempList);
  }

  addRow(template: TemplateModel, rowIndex: number) {
    const groups: TemplateGroup[] = JSON.parse(JSON.stringify(template.group));

    groups.forEach((group) => {
      if (group.values.join(",").trim().length === 0) {
        group.values = [];
      }

      switch (group.type) {
        case FieldType.DROPDOWN:
          group.values.splice(rowIndex + 1, 0, group.defaults.split(",")[0]);
          break;
        default:
          group.values.splice(rowIndex + 1, 0, group.defaults);
      }
    });

    template.group = groups;
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

    modalRef.componentInstance.isAdmin = this.isAdmin;
    modalRef.componentInstance.selectedStaff = control.value;

    modalRef.closed.subscribe(data => {
      if (data) {
        if (this.defaultForm.controls.pathologist.value?.id === data.id) {
          this.defaultForm.controls.pathologist.setValue(data);
        }

        if (this.defaultForm.controls.verifiedBy.value?.id === data.id) {
          this.defaultForm.controls.verifiedBy.setValue(data);
        }

        if (this.defaultForm.controls.performedBy.value?.id === data.id) {
          this.defaultForm.controls.performedBy.setValue(data);
        }

        control.setValue(data);
      }
    })
  }


  assignPatient(patient: any) {
    const patientObj: { name: string, dateOfBirth: string, sex: string } = patient;
    this.defaultForm.controls.name.setValue(patientObj.name);

    if (patientObj.dateOfBirth.length) {
      this.defaultForm.controls.dateOfBirth.setValue(patientObj.dateOfBirth);
      this.defaultForm.controls.age.setValue(this.calcAge);
    }


    this.defaultForm.controls.sex.setValue(patientObj.sex);
  }

  get todayDate() {
    return this.calendar.getToday();
  }

  get calcAge() {
    if (!this.defaultForm.get('dateOfBirth')?.value) {
      return "";
    }

    const [month, day, year] = this.defaultForm.get('dateOfBirth')?.value.split("/");
    let age = this.todayDate.year - parseInt(year)
    const monthDiff = this.todayDate.month - parseInt(month);
    if (monthDiff < 0 || (monthDiff === 0 && this.todayDate.day < parseInt(day))) {
      age--;
    }

    return `${age}`;
  }

  duplicateTemplate(template: TemplateModel) {
    const modalRef = this.modalService.open(TemplateModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    const dupTemplate: TemplateModel = JSON.parse(JSON.stringify(template));

    dupTemplate.id = "";
    dupTemplate.name = dupTemplate.name.concat(" - Copy");
    dupTemplate.group = dupTemplate.group.map(grp => ({ ...grp, id: "" }));

    modalRef.componentInstance.template = dupTemplate;


    modalRef.closed.pipe(switchMap(({ data }: { data: TemplateModel }) => {
      return this.api.saveTemplate(data);
    })).subscribe((newTemplate: TemplateModel) => {
      this.showSuccessToast(`Template named '${newTemplate.name} has been saved.'`);
      this.templateOptions.next([...this.templateOptions.getValue(), newTemplate]);
    });
  }

  private initFormTemplate(formId: string) {
    this.api.findRecord(formId).subscribe((patientRecord: any) => {
      const record: PatientRecordModel = {
        ...patientRecord
      } as PatientRecordModel;

      if(record.data.trim().length !== 0) {
        this.templateList.next(JSON.parse(record.data));
      }

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

      if (this.patientFormId.length !== 0 && !this.isAdmin) {
        this.defaultForm.controls.name.disable({
          onlySelf: true
        });
      }
    })
  }

  private showErrorToast(err: Error) {
    this.notifSvc.sendMessage(err.message, 'danger', 'top-left');
  }

  private showSuccessToast(content: string) {
    this.notifSvc.sendMessage(content, 'success', 'top-left');
  }

  constructor(private route: ActivatedRoute, private modalService: NgbModal,
    private calendar: NgbCalendar, private api: ApiService,
    private notifSvc: NgxNotificationService, private ngZone: NgZone, private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }
}
