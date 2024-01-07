import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Pagination, PatientModel, PatientRecordModel, StaffModel, TemplateModel } from '../shared/interfaces/template';
import { environment as env } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly API_URL = `${env.API_URL}/api/v1`

  readonly HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  saveStaff(staff: StaffModel): Observable<StaffModel> {
    return this.httpClient.post<StaffModel>(`${this.API_URL}/staff`, staff);
  }

  getStaff(): Observable<StaffModel[]> {
    return this.httpClient.get<StaffModel[]>(`${this.API_URL}/staff`);
  }

  deleteStaff(staff: StaffModel) : Observable<StaffModel> {
    return this.httpClient.delete<StaffModel>(`${this.API_URL}/staff`, {
      ...this.HTTP_OPTIONS,
      body: staff
    });
  }

  saveTemplate(template: TemplateModel): Observable<TemplateModel> {
    return this.httpClient.post<TemplateModel>(`${this.API_URL}/template`, template);
  }

  getTemplates(): Observable<TemplateModel[]> {
    return this.httpClient.get<TemplateModel[]>(`${this.API_URL}/template`).pipe(map(templates => {
      return templates.map(template => ({ ...template, group: template.group.sort((a, b) => a.priority - b.priority)}))
    }));
  }

  deleteTemplate(template: TemplateModel) : Observable<TemplateModel> {
    return this.httpClient.delete<TemplateModel>(`${this.API_URL}/template`, {
      ...this.HTTP_OPTIONS,
      body: template
    });
  }

  updateTemplate(template: TemplateModel): Observable<TemplateModel> {
    return this.httpClient.patch<TemplateModel>(`${this.API_URL}/template`, template);
  }

  saveRecord(record: {}): Observable<PatientRecordModel> {
    return this.httpClient.post<PatientRecordModel>(`${this.API_URL}/record`, record);
  }

  getRecords(pageNumber: number, pageSize: number, sortKeys?: string[], sortBy?: string) {
    return this.httpClient.get<Pagination<PatientRecordModel>>(`${this.API_URL}/record`, {
      params:  {
        pageNumber,
        pageSize,
        sortKeys: (sortKeys || []).join(","),
        sortBy: sortBy || "desc"
      },
      ...this.HTTP_OPTIONS
    });
  }

  deleteRecord(formId: string) {
    return this.httpClient.delete<PatientRecordModel>(`${this.API_URL}/record`, {
      ...this.HTTP_OPTIONS,
      body: { formId }
    })
  }

  searchRecords(pageNumber: number, pageSize: number, searchString: string, sortKeys?: string[], sortBy?: string) {
    return this.httpClient.get<Pagination<PatientRecordModel>>(`${this.API_URL}/record/search`, {
      params:  {
        query: searchString,
        pageNumber,
        pageSize,
        sortKeys: (sortKeys || []).join(","),
        sortBy: sortBy || "desc"
      },
      ...this.HTTP_OPTIONS
    });
  }

  findRecord(formId: string): Observable<PatientRecordModel> {
    return this.httpClient.get<PatientRecordModel>(`${this.API_URL}/record/${formId}`);
  }

  searchPatient(query: string) {
    return this.httpClient.get<PatientModel[]>(`${this.API_URL}/patient`, {
      params: { query },
      ...this.HTTP_OPTIONS
    });
  }

  constructor(public httpClient: HttpClient) { }
}
