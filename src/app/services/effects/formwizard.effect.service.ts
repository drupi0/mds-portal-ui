import { Injectable } from '@angular/core';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, filter, from, Observable, of, switchMap } from 'rxjs';
import { StaffModalComponent } from 'src/app/form-loader/staff-modal/staff-modal.component';
import { TemplateModalComponent } from 'src/app/form-loader/template-modal/template-modal.component';
import { FieldType } from 'src/app/shared/interfaces/form';
import { StaffModel, PatientRecordModel, TemplateModel, PatientModel } from 'src/app/shared/interfaces/template';
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

  staffList: BehaviorSubject<StaffModel[]> = new BehaviorSubject([{
    name: "Dr. Arnold Villamor, MD",
    licNo: "312696349281638912634982"
  },
  {
    name: "Dr. Maria Villamor, MD",
    licNo: "312696349281638912634985"
  },
  {
    name: "Dr. Obeñita Villamor, MD",
    licNo: "312696349281638912634987"
  }]);

  patientList: BehaviorSubject<PatientModel[]> = new BehaviorSubject([
    {
      id: "63e9f0333d295b422b1b6004",
      name: "Preston Elliott",
      sex: "male",
      dateOfBirth: "2008-04-25"
    },
    {
      id: "63e9f0332ccc54e4c6252ef1",
      name: "Santos Mccoy",
      sex: "male",
      dateOfBirth: "2006-04-21"
    },
    {
      id: "63e9f0337fe456ba89274525",
      name: "Corina Kline",
      sex: "female",
      dateOfBirth: "1978-12-15"
    },
    {
      id: "63e9f033f334db616d716fcb",
      name: "Bates Wood",
      sex: "male",
      dateOfBirth: "2006-05-20"
    },
    {
      id: "63e9f033353aefa7d2d488db",
      name: "Edwards Rivera",
      sex: "male",
      dateOfBirth: "1989-07-09"
    },
    {
      id: "63e9f033ab8779fdeb5f514e",
      name: "Owens Solis",
      sex: "male",
      dateOfBirth: "1990-11-09"
    },
    {
      id: "63e9f033202df65d7e1f8fa9",
      name: "Margarita Brennan",
      sex: "female",
      dateOfBirth: "1981-10-18"
    },
    {
      id: "63e9f033a2c45184487aa5a4",
      name: "Bradley Jackson",
      sex: "male",
      dateOfBirth: "1995-02-07"
    },
    {
      id: "63e9f033c5e4bd69b27c2a98",
      name: "Joy Ford",
      sex: "female",
      dateOfBirth: "2009-08-15"
    },
    {
      id: "63e9f033418e42ad457b9125",
      name: "Shirley David",
      sex: "female",
      dateOfBirth: "2006-01-08"
    },
    {
      id: "63e9f03302a1b978134089e4",
      name: "Donaldson Hart",
      sex: "male",
      dateOfBirth: "1991-04-06"
    },
    {
      id: "63e9f03341421b2f904385d3",
      name: "Leon Drake",
      sex: "male",
      dateOfBirth: "1974-09-17"
    },
    {
      id: "63e9f03338a13920a4c8e424",
      name: "Angela Oliver",
      sex: "female",
      dateOfBirth: "1970-11-05"
    },
    {
      id: "63e9f0331065caa22ddaf233",
      name: "Kline Maynard",
      sex: "male",
      dateOfBirth: "2007-11-23"
    },
    {
      id: "63e9f0337aec33098e35fade",
      name: "Duran Macdonald",
      sex: "male",
      dateOfBirth: "1990-07-15"
    },
    {
      id: "63e9f03334418c61dec4e1e8",
      name: "Hobbs Edwards",
      sex: "male",
      dateOfBirth: "2021-01-15"
    },
    {
      id: "63e9f033c64063f5709fc600",
      name: "Boone Aguilar",
      sex: "male",
      dateOfBirth: "2021-01-24"
    },
    {
      id: "63e9f0339b806a9000606828",
      name: "Spence Hoover",
      sex: "male",
      dateOfBirth: "1977-08-13"
    },
    {
      id: "63e9f0338e71e266004d5211",
      name: "Dale Gilliam",
      sex: "female",
      dateOfBirth: "2003-08-10"
    },
    {
      id: "63e9f033547dc1e76c7e6d45",
      name: "Melinda Ellis",
      sex: "female",
      dateOfBirth: "2019-06-30"
    }
  ] as PatientModel[])

  // formRecords: BehaviorSubject<PatientRecordModel> = new BehaviorSubject([{
    
  // }])

  saveForm(patientForm: PatientRecordModel) {
    console.log(patientForm);
  }

  getTemplateOptions(): Observable<TemplateModel[]> {
    return this.templateSelection.asObservable();
  }

  getFormTemplates(formId: string) {
    return this.getFormRecords().pipe(switchMap(records => {
      const formRecord = records.find(record => record.id === formId);

      if(!formRecord) {
        return of([]);
      }

      return of(records.find(record => record.id === formId)?.results);
    }));
  }

  saveTemplate(template: TemplateModel) {

  }

  updateTemplate(template: TemplateModel) {
    const modalRef = this.modalService.open(TemplateModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.componentInstance.template = JSON.parse(JSON.stringify(template));

    modalRef.closed.subscribe(({ data, isDeleted }: { data: TemplateModel, isDeleted: boolean }) => {

      if (isDeleted) {
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

    if (template.group[0].values.length === 0) {
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

  showStaffModal(): Observable<StaffModel> {
    const modalRef = this.modalService.open(StaffModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    return from(modalRef.closed);
  }


  getStaffList(): Observable<StaffModel[]> {
    return this.staffList.asObservable();
  }

  getPatientList(): Observable<PatientModel[]> {
    return this.patientList.asObservable();
  }

  getFormRecords() {
    const formRecords: PatientRecordModel[] = [
      {
        id: "2730873087120370123",
        patient: this.patientList.getValue()[0],
        date: new Date().toISOString(),
        results: [{
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
        }]
      },
      {
        id: "7120974309729047230",
        patient: this.patientList.getValue()[1],
        date: new Date().toISOString(),
        results: []
      },
      {
        id: "7408573045703973097543",
        patient: this.patientList.getValue()[2],
        date: new Date().toISOString(),
        results: [{
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
        }]
      }
    ] as PatientRecordModel[]

    return of(formRecords);
  }

  constructor(private store: StateService, private modalService: NgbModal, private calendar: NgbCalendar) { }
}
