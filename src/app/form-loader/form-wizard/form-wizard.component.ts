import {
  BehaviorSubject, catchError, combineLatest, debounceTime, delay, EMPTY, finalize, forkJoin, from, interval, map, Observable, of, switchMap, take, tap
} from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FieldType } from 'src/app/shared/interfaces/form';
import {
  PatientModel, PatientRecordModel, StaffModel, TemplateGroup, TemplateMode, TemplateModel
} from 'src/app/shared/interfaces/template';

import { AfterViewChecked, ChangeDetectorRef, Component, HostListener, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PrintformComponent } from '../printform/printform.component';
import { StaffModalComponent } from '../staff-modal/staff-modal.component';
import { TemplateModalComponent } from '../template-modal/template-modal.component';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { YesNoModalComponent } from 'src/app/shared/components/yes-no-modal/yes-no-modal.component';
import { Editor, toDoc, toHTML, Toolbar } from 'ngx-editor';
import { ToastrService } from 'ngx-toastr';

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
    accessionNo: new FormControl(),
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
  isSuperAdmin = false;
  isDuplicate = false;
  hasChanges = false;
  recordMode: TemplateMode = TemplateMode.TEMPLATE_MODE;
  templateModes = TemplateMode;

  editor: Editor = new Editor({
    content: '',
    plugins: [],
    nodeViews: {},
    history: true,
    keyboardShortcuts: true,
    inputRules: true,
  });

  onExit() {
    if(!this.defaultForm.dirty && !this.hasChanges) {
      return of(true);
    }

    const modalRef = this.modalService.open(YesNoModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = `Modify form "${this.patientFormId}"?`;
    modalRef.componentInstance.modalBody = `There are some unsaved changes on this form. Do you want to save them?`;
    modalRef.componentInstance.noLabel = "No";

    return modalRef.closed.pipe(switchMap(response => {
      if(response) {
        return this.callSaveApi().pipe(finalize(() => {
          this.showSuccessToast(`Form ${this.patientFormId} successfully saved`);
        }), switchMap(() => of(true)));
      }

      return of(true);
    }));
  }

  initFormBuilder() {
    this.api.getTemplates().subscribe((list: TemplateModel[]) => {
      this.templateOptions.next(list)
    });

    combineLatest([this.route.params, this.route.queryParams]).pipe(map(([param, query]) => ({
      ...param,
      ...query
    }))).subscribe(param => {
      const { formId, duplicate, preview } = param;

      if(duplicate !== null) {
        this.isDuplicate = duplicate;
      }

      if(this.isDuplicate) {
        this.breadcrumbSvc.current.title = "New Patient Record";
      }

      if (formId) {
        this.patientFormId = formId;
        this.initFormTemplate(formId);
      }

      if(preview) {
        this.printForm();
      }
    })
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
      const { isAdmin, isSuperAdmin } = data;
      (isAdmin as Observable<boolean>).subscribe(access => this.isAdmin = access);
      (isSuperAdmin as Observable<boolean>).subscribe(access => this.isSuperAdmin = access);
    });

    this.initFormBuilder();
  }

  editTemplate(template: TemplateModel) {
    this.updateTemplate(template);
    this.hasChanges = true;
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

      this.hasChanges = true;

    });
  }

  onDtChange(template: TemplateModel, groupId: string, row: number, event: string) {
    const groupIndex = template.group.findIndex(group => group.id === groupId);
    if(groupIndex !== -1) {
      template.group[groupIndex].values[row] = event;

      this.hasChanges = true;
    }
  }

  trackByFn(index: number) {
    return index;
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

    this.hasChanges = true;

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
      accessionNo: formValue.accessionNo,
      orderingDoctor: formValue.orderingDr,
      status: formValue.status,
      specimen: formValue.specimen,
      ordered: formValue.ordered,
      collectionDateTime: formValue.collectionDateTime,
      receivedDateTime: formValue.receivedDateTime,
      data: JSON.stringify(this.templateList.getValue()),
      comments: !!formValue.comment ? toHTML(formValue.comment) : "",
      mode: this.recordMode
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

    this.hasChanges = true;
  }

  private callSaveApi() {
    return this.api.saveRecord(this.prepareRecord()).pipe(catchError((err: Error) => {
      this.showErrorToast(err);
      return EMPTY;
    }));
  }

  saveForm(navigateToHome: boolean = true) {
    this.callSaveApi().subscribe((record: PatientRecordModel) => {
      this.hasChanges = false;
      this.defaultForm.markAsPristine();
      
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

  printForm(printNow: boolean = false) {
    this.modalService.dismissAll();
    const modalRef = this.modalService.open(PrintformComponent, {
      fullscreen: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.formData = this.prepareRecord();
    modalRef.componentInstance.printNow = printNow;
  }

  @HostListener('window:keydown.control.p', ['$event'])
  @HostListener('window:keydown.Meta.p', ['$event'])
  printNowHandler(event: KeyboardEvent) {
    event.preventDefault();
    this.printForm(true);
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

      this.hasChanges = true;
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
    this.hasChanges = true;
  }

  addRow(template: TemplateModel, rowIndex: number) {
    const groups: TemplateGroup[] = JSON.parse(JSON.stringify(template.group));

    groups.forEach((group) => {
      if (group.values.join(",").trim().length === 0) {
        group.values = [];
      }

      switch (group.type) {
        case FieldType.DROPDOWN:
          if(!group.values.length) {
            group.values = Array(2).fill(group.defaults.split(",")[0]);
            break;
          }
          
          group.values.splice(rowIndex + 1, 0, group.defaults.split(",")[0]);
          break;
        default:
          if(!group.values.length) {
            group.values = Array(2).fill(group.defaults);
            break;
          }
          group.values.splice(rowIndex + 1, 0, group.defaults);
      }
    });

    template.group = groups;

    this.hasChanges = true;
  }

  removeFromTemplateField(templateIndex: number) {
    const tempList = this.templateList.getValue();
    tempList.splice(templateIndex, 1);
    this.templateList.next(tempList);

    this.hasChanges = true;
  }

  showStaffModal(control: FormControl) {
    const modalRef = this.modalService.open(StaffModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.componentInstance.isAdmin = this.isAdmin || this.isSuperAdmin;
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

    this.hasChanges = true;
  }

  dateOfBirthChange(dateStr: string) {
    this.defaultForm.controls.dateOfBirth.setValue(dateStr);
    console.log(this.defaultForm.getRawValue());
    // this.defaultForm.getRawValue();
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

    this.hasChanges = true;
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
        id: !this.isDuplicate ? record.id : null,
        name: record.patient.name,
        age: this.calcAge,
        sex: record.patient.sex,
        dateOfBirth: record.patient.dateOfBirth,
        specNo: record.specNo,
        accessionNo: record.accessionNo,
        orderingDr: record.orderingDoctor,
        status: record.status,
        specimen: record.specimen,
        ordered: record.ordered,
        collectionDateTime: record.collectionDateTime,
        receivedDateTime: record.receivedDateTime,
        comment: toDoc(record.comments),
        performedBy: record.performedBy,
        verifiedBy: record.verifiedBy,
        pathologist: record.pathologist
      }

      this.defaultForm.setValue(formValues);
      this.recordMode = record.mode || TemplateMode.TEMPLATE_MODE;

      if (this.patientFormId.length !== 0 && !(this.isAdmin || this.isSuperAdmin)) {
        this.defaultForm.controls.name.disable({
          onlySelf: true
        });
      }
    })
  }

  private showErrorToast(err: Error) {
    this.notifSvc.error(err.message, "Error");
  }

  private showSuccessToast(content: string) {
    this.notifSvc.success(content, "Success");
  }

  constructor(private route: ActivatedRoute, private modalService: NgbModal,
    private calendar: NgbCalendar, private api: ApiService,
    private notifSvc: ToastrService, private ngZone: NgZone, private router: Router,
    private cdRef: ChangeDetectorRef, private breadcrumbSvc: BreadcrumbService 
  ) { }
}
