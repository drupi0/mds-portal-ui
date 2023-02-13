import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormwizardEffectService } from 'src/app/services/effects/formwizard.effect.service';
import { FieldType } from 'src/app/shared/interfaces/form';
import { DoctorModel, PatientModel, PatientRecordModel, TemplateModel } from 'src/app/shared/interfaces/template';
import { TemplateModalComponent } from '../template-modal/template-modal.component';

@Component({
  selector: 'mds-form-wizard',
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.scss']
})
export class FormWizardComponent implements OnInit {
  defaultForm = new FormGroup({
    name: new FormControl(),
    age: new FormControl(),
    sex: new FormControl(),
    dateOfBirth: new FormControl(),
    specNo: new FormControl(),
    orderingDr: new FormControl(),
    status: new FormControl(),
    specimen: new FormControl(),
    ordered: new FormControl(),
    collectionDateTime: new FormControl(),
    receivedDateTime: new FormControl(),
    comment: new FormControl(),
    performedBy: new FormControl(),
    verifiedBy: new FormControl(),
    pathologist: new FormControl()
  });

  templateOptions: TemplateModel[] = [];
  templateList: TemplateModel[] = [];


  ngOnInit() {
    this.effect.getTemplateOptions().subscribe(templates => {
      this.templateOptions = templates;
    });

    const formId = "1234";
    // const formId = null;

    if(formId) {
      this.effect.getFormTemplates(formId).subscribe(templates => {
        this.templateList = templates;
      });
    }
   
  }

  editTemplate(template: TemplateModel) {
    this.effect.updateTemplate(template);
  }

  saveTemplate(templateIndex: number, template: HTMLTableSectionElement) {
    let formTemplate: TemplateModel = this.templateList[templateIndex];

    formTemplate.group.forEach(group => group.values = []);

    Array.from(template.getElementsByTagName("tr")).forEach(row => {
      Array.from(row.getElementsByClassName("tbl-data")).forEach((data, index) => {
        const value = (data as HTMLInputElement).value;
        formTemplate.group[index].values.push(!value ? '' : value.trim());
      });
    });

    const indexNo = this.templateOptions.findIndex(template => template.id === formTemplate.id);

    if(indexNo !== -1) {
      this.templateOptions.splice(indexNo, 1);
      this.templateOptions.push(formTemplate);
    }
  }

  dropdownClick(templateIndex: number, colIndex: number, rowIndex: number, value: string) {
    const newValues = [...this.templateList[templateIndex].group[colIndex].values];

    newValues.splice(rowIndex, 1, value);

    this.templateList[templateIndex].group[colIndex].values = newValues;
  }

  saveForm() {
    const formValue = this.defaultForm.getRawValue();
    const patientModel: PatientModel = {
      name: formValue.name,
      dateOfBirth: formValue.dateOfBirth,
      sex: formValue.sex,
    };

    const patientRecord: PatientRecordModel = {
      date: new Date().toDateString(),
      patient: patientModel,
      pathologist: {} as DoctorModel,
      performedBy: {} as DoctorModel,
      verifiedBy: {} as DoctorModel,
      specNo: formValue.specNo,
      orderingDoctor: formValue.orderingDr,
      status: formValue.status,
      specimen: formValue.specimen,
      ordered: formValue.ordered,
      collectionDateTime: formValue.collectionDateTime,
      receivedDateTime: formValue.receivedDateTime,
      results: this.templateList,
      comments: formValue.comment
    }

    this.effect.saveForm(patientRecord);
  }

  clearForm() {
    this.defaultForm.reset();
    this.templateList = [];
  }

  printForm() {

  }

  newTemplate() {
    const modalRef = this.modalService.open(TemplateModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.closed.subscribe(({data}: { data: TemplateModel}) => {
      this.templateOptions.push(data);
    });
  }

  removeRow(templateIndex: number, rowIndex: number) {
    this.templateList[templateIndex].group.forEach((group) => {
      if (group.values.length === 1) {
        return;
      }

      group.values.splice(rowIndex, 1);
    });
  }

  addToTemplateField(template: TemplateModel) {
    this.effect.addToTemplateField(template);
  }

  addRow(templateIndex: number) {
    this.effect.addRowByIndex(templateIndex);
  }

  removeFromTemplateField(templateIndex: number) {
    this.templateList.splice(templateIndex, 1);
  }

  get todayDate() {
    return this.calendar.getToday();
  }

  get calcAge() {
    if(!this.defaultForm.get('dateOfBirth')?.value) {
      return "";
    }

    const { year, month, day } = this.defaultForm.get('dateOfBirth')?.value;
    let age = this.todayDate.year - year
    const monthDiff = this.todayDate.month - month;
    if(monthDiff < 0 || (monthDiff === 0 && this.todayDate.day < day)) {
      age--;
    }

    return `${age}`;
  }

  constructor(private modalService: NgbModal, private calendar: NgbCalendar, private effect: FormwizardEffectService) { }
}
