import { Injectable } from '@angular/core';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { TemplateModalComponent } from 'src/app/form-loader/template-modal/template-modal.component';
import { FieldType } from 'src/app/shared/interfaces/form';
import { PatientRecordModel, TemplateModel } from 'src/app/shared/interfaces/template';
import { StateService } from '../state.service';

@Injectable({
  providedIn: 'root'
})
export class FormwizardEffectService {

  templateSelection: BehaviorSubject<TemplateModel[]> = new BehaviorSubject([{
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
  }] as TemplateModel[]);

  templateFields: BehaviorSubject<TemplateModel[]> = new BehaviorSubject([{
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
  }] as TemplateModel[]);

  saveForm(patientForm: PatientRecordModel) {
    console.log(patientForm);
  }

  getTemplateOptions(): Observable<TemplateModel[]> {
    return this.templateSelection.asObservable();
  }

  getFormTemplates(formId: string) {
    return this.templateFields.asObservable();
  }

  saveTemplate(template: TemplateModel) {

  }

  updateTemplate(template: TemplateModel) {
    const modalRef = this.modalService.open(TemplateModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.componentInstance.template = JSON.parse(JSON.stringify(template)); 

    modalRef.closed.subscribe(({data, isDeleted}: { data: TemplateModel, isDeleted: boolean}) => {
    
      if(isDeleted) {
        const templateList = this.templateFields.getValue().filter(templateField => templateField.id !== template.id);
        const templateOptions = this.templateSelection.getValue().filter(templateItem => templateItem.id !== template.id);

        this.templateFields.next(templateList);
        this.templateSelection.next(templateOptions);

        return;
      }

      const templateOptions = this.templateSelection.getValue().filter(templateItem => templateItem.id !== template.id);
      templateOptions.unshift(data);
      this.templateSelection.next(templateOptions);

      this.templateFields.next(this.templateFields.getValue().filter(templateField => templateField.id !== template.id));
      
      
      this.addToTemplateField(data);
    });
  }

  addToTemplateField(template: TemplateModel) {
    const templateList = this.templateFields.getValue();

    if(template.group[0].values.length === 0) {
      this.addRow(template);
    }

    templateList.push(template);
    this.templateFields.next(templateList);
  }

  addRowByIndex(templateIndex: number) {
    this.addRow(this.templateFields.getValue()[templateIndex]);
  }

  addRow(template: TemplateModel) {
    template.group.forEach((group) => {
      switch (group.type) {
        case FieldType.DROPDOWN:
          group.values.push(group.defaults.split(",")[0]);
          break;
        default:
          group.values.push(group.defaults);
      }
    });
  }

  constructor(private store: StateService, private modalService: NgbModal, private calendar: NgbCalendar){}
}
