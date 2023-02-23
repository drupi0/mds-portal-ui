import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { YesNoModalComponent } from 'src/app/shared/components/yes-no-modal/yes-no-modal.component';
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

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal) { }

  changeType(key: string, index: number) {
    this.template.group[index].type = key as FieldType;
  }

  onDateSelect(index: number, date: NgbDate) {
    this.template.group[index].defaults = `${date.year}-${
      date.month.toLocaleString('en-US', { minimumIntegerDigits: 2 })}-${
      date.day.toLocaleString('en-US', { minimumIntegerDigits: 2 })}`
  }

  addNewColumn() {
    this.template.group.push({
      name: `Column ${this.template.group.length + 1}`,
      type: FieldType.DEFAULT,
      defaults: "",
      values: [""]
    });
  }

  removeColumn(index: number) {
    if (this.template.group.length === 1) {
      return;
    }

    this.template.group.splice(index, 1);
  }

  save() {
    this.activeModal.close({
      data: this.template,
      isDeleted: false
    });
  }

  dismiss() {
    this.activeModal.dismiss();
  }

  delete() {
    const modalRef = this.modalService.open(YesNoModalComponent, {
      size: 'md',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = `Delete "${ this.template.name }"?`
    modalRef.componentInstance.modalBody = `All current instance of this template will also be removed. Old forms will not be affected. 
                                            Are you sure you want to delete "${ this.template.name}"?`

    modalRef.closed.subscribe((response) => {
        if(response) {
          this.activeModal.close({
            data: this.template,
            isDeleted: true
          });
      }
    })
  }

  get saveDisabled() {
      return [this.template.name.trim().length === 0, this.template.group.length === 0, 
        this.template.group.some(col => col.type === FieldType.DEFAULT),
        this.template.group.some(col => col.type === FieldType.DROPDOWN && !col.defaults)].some(check => check);
  }


  ngOnInit(): void {
    this.isNew = false;

    if (!Object.keys(this.template).length) {
      this.isNew = true;
      this.template = {
        id: "",
        name: "",
        group: [
          {
            name: "Column 1",
            type: FieldType.DEFAULT,
            defaults: "",
            values: []
          },
          {
            name: "Column 2",
            type: FieldType.DEFAULT,
            defaults: "",
            values: []
          },
        ]
      }
    }
  }
}
