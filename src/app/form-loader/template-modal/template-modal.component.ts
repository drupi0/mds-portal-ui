import { CdkDragDrop, CDK_DRAG_CONFIG, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { YesNoModalComponent } from 'src/app/shared/components/yes-no-modal/yes-no-modal.component';
import { FieldType } from 'src/app/shared/interfaces/form';
import { TemplateGroup, TemplateModel } from 'src/app/shared/interfaces/template';

const DragConfig = {
  zIndex: 10000
};

@Component({
  selector: 'mds-template-modal',
  templateUrl: './template-modal.component.html',
  styleUrls: ['./template-modal.component.scss'],
  providers: [{ provide: CDK_DRAG_CONFIG, useValue: DragConfig }]
})
export class TemplateModalComponent implements OnInit {
  @Input() template: TemplateModel = {} as TemplateModel;

  isNew: boolean = false;

  selectionList = FieldType;
  groups: any = ["hello test", "hello", "world", "hello test1", "hello test2", "hello test3"];

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal) { }

  changeType(key: string, index: number) {
    this.template.group[index].type = key as FieldType;

    this.template.group[index].defaults = "";
    for(let i = 0; i <  this.template.group[index].values.length; i++) {
      this.template.group[index].values[i] = "";
    }
  }

  onDateSelect(index: number, date: string) {
    this.template.group[index].defaults = date
    for(let i = 0; i <  this.template.group[index].values.length; i++) {
      this.template.group[index].values[i] = date;
    }
  }

  addNewColumn(index: number) {
    this.template.group.splice(index + 1, 0, {
      name: `Column ${this.template.group.length + 1}`,
      type: FieldType.DEFAULT,
      defaults: "",
      values: [""],
      priority: index + 1
    });
  }

  duplicateColumn(index: number) {
    const duplicated: TemplateGroup = JSON.parse(JSON.stringify(this.template.group[index]));
    duplicated.id = "";
    duplicated.name = duplicated.name + " - Copy";
    duplicated.priority = index + 1;

    this.template.group.splice(index + 1, 0, duplicated);
  }

  removeColumn(index: number) {
    if (this.template.group.length === 1) {
      return;
    }

    this.template.group.splice(index, 1);
  }

  save() {
   this.template.group.forEach((g, index) => g.priority = index)

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
            values: [],
            priority: 0
          },
          {
            name: "Column 2",
            type: FieldType.DEFAULT,
            defaults: "",
            values: [],
            priority: 1
          },
        ]
      }
    }
  }

  sort(event: CdkDragDrop<TemplateGroup[]>) {
    const tempGroup: TemplateGroup[] = this.template.group;

    this.template.group[event.previousIndex].priority = event.currentIndex;
    this.template.group[event.currentIndex].priority = event.previousIndex;

    moveItemInArray(tempGroup, event.previousIndex, event.currentIndex);

    this.template.group = tempGroup;
  }
}
