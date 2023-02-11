import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
    values: {
      column: [{
        name: "ANALYTE",
        type: "TEXT",
        defaults: "HELLO"
      },
      {
        name: "RESULT",
        type: "DROPDOWN",
        defaults: "Hello, 1234, 5678"
      },
    ],
      rows: []
    }
  }]

  templateFields = [{
    name: "Complete Blood Count",
    id: "12345",
    values: {
      column: [{
        name: "ANALYTE",
        type: "TEXT",
        defaults: "HELLO"
      },
      {
        name: "RESULT",
        type: "DROPDOWN",
        defaults: "Hello, 1234, 5678"
      },
    ],
      rows: [
        ["HELLO", "Hello"]
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

  ngOnInit() {
    this.newTemplate();
  }

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

    const modalRef = this.modalService.open(TemplateModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });
		modalRef.componentInstance.name = 'World';
    
    // const newTemplate = {
    //   name: "",
    //   id: "",
    //   values: {
    //     column: ["Col1"],
    //     rows: []
    //   }
    // }

    // this.templateFields.push(newTemplate);
    // this.addRow(this.templateFields.length - 1);
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

  constructor(private modalService: NgbModal) {}
}
