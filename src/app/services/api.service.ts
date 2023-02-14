import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { env } from 'src/environment';
import { StaffModel, TemplateModel } from '../shared/interfaces/template';

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

  constructor(public httpClient: HttpClient) { }
}
