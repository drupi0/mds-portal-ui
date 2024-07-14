import { CdkDragDrop, CDK_DRAG_CONFIG, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Editor, Toolbar } from 'ngx-editor';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, first, interval } from 'rxjs';
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
  isDragging: boolean = false;

  selectionList = FieldType;
  hiddenFieldTypes: FieldType[] = [FieldType.RICHTEXT, FieldType.LABEL];
  groups: any = ["hello test", "hello", "world", "hello test1", "hello test2", "hello test3"];

  editorInstances: Record<number, { editor: Editor, toolbar: Toolbar, value: string }> = {};

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal, private notifSvc: ToastrService) { }

  changeType(key: string, index: number) {
    this.createNewEditorInstance(index);

    this.template.group[index].type = key as FieldType;

    this.template.group[index].defaults = "";

    for (let i = 0; i < this.template.group[index].values.length; i++) {
      this.template.group[index].values[i] = "";
    }
  }

  onDateSelect(index: number, date: string) {
    this.template.group[index].defaults = date
    for (let i = 0; i < this.template.group[index].values.length; i++) {
      this.template.group[index].values[i] = date;
    }
  }

  addNewColumn(index: number) {
    this.template.group.splice(index + 1, 0, {
      name: `${this.template.isFormMode ? "Field" : "Column"} ${this.template.group.length + 1}`,
      type: FieldType.DEFAULT,
      defaults: "",
      values: [""],
      priority: index + 1
    });

    this.rebuildEditorInstances();
  }

  duplicateColumn(index: number) {
    const duplicated: TemplateGroup = JSON.parse(JSON.stringify(this.template.group[index]));
    duplicated.id = "";
    duplicated.name = duplicated.name + " - Copy";
    duplicated.priority = index + 1;

    this.template.group.splice(index + 1, 0, duplicated);
    this.rebuildEditorInstances();
  }

  removeColumn(index: number) {
    if (this.template.group.length === 1) {
      return;
    }

    this.template.group.splice(index, 1);
    this.rebuildEditorInstances();
  }

  save() {
    this.template.group.forEach((g, index) => g.priority = index);

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

    modalRef.componentInstance.title = `Delete "${this.template.name}"?`
    modalRef.componentInstance.modalBody = `All current instance of this template will also be removed. Old forms will not be affected. 
                                            Are you sure you want to delete "${this.template.name}"?`

    modalRef.closed.subscribe((response) => {
      if (response) {
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
        isFormMode: false,
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

    this.template.group.forEach((groupItem, index) => {
      if (groupItem.type === FieldType.RICHTEXT) {
        this.createNewEditorInstance(index);
      }
    });
  }

  sort(event: CdkDragDrop<TemplateGroup[]>) {
    const tempGroup: TemplateGroup[] = this.template.group;

    this.template.group[event.previousIndex].priority = event.currentIndex;
    this.template.group[event.currentIndex].priority = event.previousIndex;

    moveItemInArray(tempGroup, event.previousIndex, event.currentIndex);

    this.template.group = tempGroup;

    this.rebuildEditorInstances();
  }

  enableFormMode(isFormMode: boolean) {

    if(isFormMode) {
      this.hiddenFieldTypes = [];
      this.template.isFormMode = isFormMode;
      return;
    }

    const modalRef = this.modalService.open(YesNoModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = `Turn off form mode?`
    modalRef.componentInstance.modalBody = `Turning this off will remove all richtext and label fields from the template. Do you want to continue?`

    modalRef.closed.subscribe((response) => {
      if (response) {
        this.template.isFormMode = isFormMode;
        this.hiddenFieldTypes.push(FieldType.RICHTEXT, FieldType.LABEL);
        this.template.group = this.template.group.filter(groupItem => !this.hiddenFieldTypes.includes(groupItem.type));

        if (!this.template.group.length) {
          this.addNewColumn(0);
        }
      } else {
        this.template.isFormMode = true;
      }
    });
  }

  private rebuildEditorInstances() {
    this.editorInstances = {};

    this.template.group.forEach((gItem, index) => {
      if(gItem.type === FieldType.RICHTEXT) {
        this.createNewEditorInstance(index);
      }
    })
  }

  private createNewEditorInstance(index: number) {
    const currentEditorInstance = this.editorInstances;
    currentEditorInstance[index] = this.editorSource();
    currentEditorInstance[index].value = this.template.group[index].defaults;

    this.editorInstances = currentEditorInstance;
  }

  private editorSource(): {
    editor: Editor;
    toolbar: Toolbar;
    value: string;
  } {
    const editor: Editor = new Editor({
      content: '',
      plugins: [],
      nodeViews: {},
      history: true,
      keyboardShortcuts: true,
      inputRules: true,
    });

    const toolbar: Toolbar = [
      ['bold', 'italic'],
      ['underline', 'strike'],
      ['code', 'blockquote'],
      ['ordered_list', 'bullet_list'],
      [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      ['link', 'image'],
      ['text_color', 'background_color'],
      ['align_left', 'align_center', 'align_right', 'align_justify'],
    ];

    return { editor, toolbar, value: '' }
  }
}
