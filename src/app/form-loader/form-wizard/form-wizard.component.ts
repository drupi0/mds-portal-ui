import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { map, of } from 'rxjs';
import { TemplateModel } from 'src/app/interfaces/template';

@Component({
  selector: 'mds-form-wizard',
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.scss']
})
export class FormWizardComponent {
  templateSelection = [{
    name: "Complete Blood Count",
    id: "12345",
    values: {
      column: ["ANALYTE", "RESULT", "SI UNIT", "REF RANGE", "RESULT", "CONV UNIT", "REF RANGE", "FLAG"],
      rows: []
    }
  },
  {
    name: "Template 2",
    id: "123245",
    values: {
      column: ["ANALYTE", "RESULT", "SI UNIT", "REF RANGE", "RESULT", "CONV UNIT", "REF RANGE", "FLAG"],
      rows: []
    }
  },
  {
    name: "Template 3",
    id: "123435",
    values: {
      column: ["ANALYTE", "RESULT", "SI UNIT", "REF RANGE", "RESULT", "CONV UNIT", "REF RANGE", "FLAG"],
      rows: []
    }
  }]

  templateFields = [{
    name: "Complete Blood Count",
    id: "12345",
    values: {
      column: ["ANALYTE", "RESULT", "SI UNIT", "REF RANGE", "RESULT", "CONV UNIT", "REF RANGE", "FLAG", "ANALYTE", "RESULT", "SI UNIT", "REF RANGE", "RESULT", "CONV UNIT", "REF RANGE", "FLAG"],
      rows: [
        ["White Blood Cell", "10", "20", "30", "40", "50", "60", "70"]
      ]
    }
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

  editRootColumn(index: number) {

  }

  saveTemplate(isNew: boolean, templateIndex: number, template: HTMLTableSectionElement) {
    const rows: string[][] = [];
    Array.from(template.getElementsByTagName("tr")).forEach(row => {
      const col: string[] = [];
      Array.from(row.getElementsByTagName("input")).forEach(input => {
        col.push(input.value);
      });

      rows.push(col);
    });

    this.templateFields[templateIndex].values.rows = rows;

    console.log(this.templateFields);
  }

  saveForm() {
    console.log(this.defaultForm.getRawValue());
  }

  clearForm() {

  }

  printForm() {

  }

  newTemplate() {
    const newTemplate = {
      name: "",
      id: "",
      values: {
        column: ["Col1"],
        rows: []
      }
    }

    this.templateFields.push(newTemplate);
    this.addRow(this.templateFields.length - 1);
  }

  addRow(templateIndex: number) {
    const newRow : string[] = [];
    this.templateFields[templateIndex].values.column.forEach(col => newRow.push(""));
    this.templateFields[templateIndex].values.rows.push(newRow)
  }

  removeRow(templateIndex: number, rowIndex: number) {
    this.templateFields[templateIndex].values.rows.splice(rowIndex, 1);
    
    if(!this.templateFields[templateIndex].values.rows.length) {
      this.addRow(templateIndex);
    }
  }

  addToTemplateField(templateIndex: number) {
    this.templateFields.push(this.templateSelection[templateIndex]);
    this.addRow(this.templateFields.length - 1);
  }

  removeFromTemplateField(templateIndex: number) {
    this.templateFields.splice(templateIndex, 1);
  }
}
