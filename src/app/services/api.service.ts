import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { env } from 'src/environment';
import { FormModel } from '../shared/interfaces/form';
import { Pagination, PatientModel, PatientRecordModel, StaffModel, TemplateModel } from '../shared/interfaces/template';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly BASE_URL = `${env.BASE_URL}/api/v1`

  readonly HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  saveStaff(staff: StaffModel): Observable<StaffModel> {
    return this.httpClient.post<StaffModel>(`${this.BASE_URL}/staff`, staff);
  }

  getStaff(): Observable<StaffModel[]> {
    return this.httpClient.get<StaffModel[]>(`${this.BASE_URL}/staff`);
  }

  deleteStaff(staff: StaffModel) : Observable<StaffModel> {
    return this.httpClient.delete<StaffModel>(`${this.BASE_URL}/staff`, {
      ...this.HTTP_OPTIONS,
      body: staff
    });
  }

  saveTemplate(template: TemplateModel): Observable<TemplateModel> {
    return this.httpClient.post<TemplateModel>(`${this.BASE_URL}/template`, template);
  }

  getTemplates(): Observable<TemplateModel[]> {
    return this.httpClient.get<TemplateModel[]>(`${this.BASE_URL}/template`);
  }

  deleteTemplate(template: TemplateModel) : Observable<TemplateModel> {
    return this.httpClient.delete<TemplateModel>(`${this.BASE_URL}/template`, {
      ...this.HTTP_OPTIONS,
      body: template
    });
  }

  updateTemplate(template: TemplateModel): Observable<TemplateModel> {
    return this.httpClient.patch<TemplateModel>(`${this.BASE_URL}/template`, template);
  }

  saveRecord(record: {}): Observable<PatientRecordModel> {
    return this.httpClient.post<PatientRecordModel>(`${this.BASE_URL}/record`, record);
  }

  getRecords(pageNumber: number, pageSize: number) {
    return this.httpClient.get<Pagination<PatientRecordModel>>(`${this.BASE_URL}/record`, {
      params: { pageNumber, pageSize },
      ...this.HTTP_OPTIONS
    }).pipe(map((data) => {
      return {
        ...data,
        content: data.content?.map(record => ({ ...record, data: JSON.parse(record.data)}))
      }
    }));
  }

  deleteRecord(formId: string) {
    return this.httpClient.delete<PatientRecordModel>(`${this.BASE_URL}/record`, {
      ...this.HTTP_OPTIONS,
      body: { formId }
    })
  }

  searchRecords(pageNumber: number, pageSize: number, searchString: string) {
    return this.httpClient.get<Pagination<PatientRecordModel>>(`${this.BASE_URL}/record/search`, {
      params: { pageNumber, pageSize, query: searchString },
      ...this.HTTP_OPTIONS
    });
  }

  findRecord(formId: string): Observable<PatientRecordModel> {
    return this.httpClient.get<PatientRecordModel>(`${this.BASE_URL}/record/${formId}`);
  }

  searchPatient(query: string) {
    return this.httpClient.get<PatientModel[]>(`${this.BASE_URL}/patient`, {
      params: { query },
      ...this.HTTP_OPTIONS
    });
  }

  constructor(public httpClient: HttpClient) { }
}
