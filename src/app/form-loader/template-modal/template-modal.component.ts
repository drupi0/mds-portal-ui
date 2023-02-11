import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { FieldType } from 'src/app/shared/interfaces/form';
import { TemplateModel } from 'src/app/shared/interfaces/template';



@Component({
  selector: 'mds-template-modal',
  templateUrl: './template-modal.component.html',
  styleUrls: ['./template-modal.component.scss']
})
export class TemplateModalComponent implements OnInit {
  @Input() template: TemplateModel = {} as TemplateModel;

  isNew: boolean = false;

  selectionList = FieldType;

  constructor(public activeModal: NgbActiveModal) { }

  changeType(key: string, index: number) {
    this.template.values.column[index].type = key;
  }

  onDateSelect(index: number, date: NgbDate) {
    this.template.values.column[index].defaults = `${date.year}-${
      date.month.toLocaleString('en-US', { minimumIntegerDigits: 2 })}-${
      date.day.toLocaleString('en-US', { minimumIntegerDigits: 2 })}`
  }

  addNewColumn() {
    this.template.values.column.push({
      name: `Col ${this.template.values.column.length + 1}`,
      type: FieldType.DEFAULT,
      defaults: ""
    });
  }

  removeColumn(index: number) {
    if (this.template.values.column.length === 1) {
      return;
    }

    this.template.values.column.splice(index, 1);
  }

  save() {
    this.activeModal.close(this.template);
  }

  get saveDisabled() {
      return [this.template.name.trim().length === 0, this.template.values.column.length === 0, 
        this.template.values.column.some(col => col.type === FieldType.DEFAULT)].some(check => check);
  }


  ngOnInit(): void {
    this.isNew = false;

    if (!Object.keys(this.template).length) {
      this.isNew = true;
      this.template = {
        id: "",
        name: "",
        values: {
          column: [{
            name: "Col 1",
            type: FieldType.DEFAULT,
            defaults: "test|123|4567"
          }],
          rows: []
        }
      }
    }
  }
}
