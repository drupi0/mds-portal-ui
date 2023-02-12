import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FieldType } from 'src/app/shared/interfaces/form';
import { TemplateModel } from 'src/app/shared/interfaces/template';
import { TemplateModalComponent } from '../template-modal/template-modal.component';

@Component({
  selector: 'mds-form-wizard',
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.scss']
})
export class FormWizardComponent implements OnInit {
  templateSelection: TemplateModel[] = [{
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
  }]

  templateFields: TemplateModel[] = [{
    name: "Complete Blood Count",
    id: "12345",
    group: [{
      name: "Analyte",
      type: FieldType.TEXT,
      defaults: "Col 1",
      values: ["White Blood Cell", "Reb Blood Cell", "Hemoglobin"]
    },
    {
      name: "Flag",
      type: FieldType.DROPDOWN,
      defaults: "Select Item, L , H",
      values: ["L", "H", "L"]
    },
    {
      name: "REF RANGE",
      type: FieldType.NUMBER,
      defaults: "10",
      values: ["0", "10", "10"]
    },
    {
      name: "DOB",
      type: FieldType.DATETIME,
      defaults: "2020-10-10",
      values: ["", "", ""]
    }
    ],
  }];

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

  ngOnInit() {
  }

  editTemplate(templateId: string) {
    const modalRef = this.modalService.open(TemplateModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    let selectedTemplate =  this.templateSelection.find(template => template.id === templateId);
    modalRef.componentInstance.template = selectedTemplate 

    modalRef.closed.subscribe(({data, isDeleted}: { data: TemplateModel, isDeleted: boolean}) => {

      console.log(isDeleted);

      if(isDeleted) {
        this.templateFields = this.templateFields.filter(template => template.id !== templateId);
        this.templateSelection = this.templateSelection.filter(template => template.id !== templateId);

        return;
      }

      selectedTemplate = data;
      this.templateFields = this.templateFields.filter(template => template.id !== templateId);

      this.addToTemplateField(this.templateSelection.length - 1);

    });
  }

  saveTemplate(templateIndex: number, template: HTMLTableSectionElement) {
    let formTemplate: TemplateModel = this.templateFields[templateIndex];

    formTemplate.group.forEach(group => group.values = []);

    Array.from(template.getElementsByTagName("tr")).forEach(row => {
      Array.from(row.getElementsByClassName("tbl-data")).forEach((data, index) => {
        const value = (data as HTMLInputElement).value;
        formTemplate.group[index].values.push(!value ? '' : value.trim());
      });
    });

    const indexNo = this.templateSelection.findIndex(template => template.id === formTemplate.id);

    if(indexNo !== -1) {
      this.templateSelection.splice(indexNo, 1);
      this.templateSelection.push(formTemplate);
    }
  }

  dropdownClick(templateIndex: number, colIndex: number, rowIndex: number, value: string) {
    const newValues = [...this.templateFields[templateIndex].group[colIndex].values];

    newValues.splice(rowIndex, 1, value);

    this.templateFields[templateIndex].group[colIndex].values = newValues;
  }

  saveForm() {
    console.log(this.defaultForm.getRawValue());
    console.log(this.templateFields);
  }

  clearForm() {
    this.defaultForm.reset();
    this.templateFields = [];
  }

  printForm() {

  }

  newTemplate() {
    const modalRef = this.modalService.open(TemplateModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.closed.subscribe(({data}: { data: TemplateModel}) => {
      this.templateSelection.push(data);
    });
  }

  addRow(templateIndex: number) {
    this.templateFields[templateIndex].group.forEach((group) => {
      switch (group.type) {
        case FieldType.DROPDOWN:
          group.values.push(group.defaults.split(",")[0]);
          break;
        default:
          group.values.push(group.defaults);
      }
    });
  }

  removeRow(templateIndex: number, rowIndex: number) {
    this.templateFields[templateIndex].group.forEach((group) => {
      if (group.values.length === 1) {
        return;
      }

      group.values.splice(rowIndex, 1);
    });
  }

  addToTemplateField(templateIndex: number) {
    const newTemplate: TemplateModel = JSON.parse(JSON.stringify(this.templateSelection[templateIndex]));
    this.templateFields.push(newTemplate);

    if(!newTemplate.group[0].values.length) {
      this.addRow(this.templateFields.length - 1);
    }
  }

  removeFromTemplateField(templateIndex: number) {
    this.templateFields.splice(templateIndex, 1);
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

  constructor(private modalService: NgbModal, private calendar: NgbCalendar) { }
}
