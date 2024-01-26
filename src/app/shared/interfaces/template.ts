import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { FieldType } from './form';

export interface TemplateModel {
    name: string;
    id: string;
    group: TemplateGroup[];
}

export interface TemplateGroup {
    id?: string;
    priority: number;
    name: string;
    type: FieldType;
    defaults: string;
    values: string[];
}
export interface PatientModel {
    id?: string
    name: string,
    dateOfBirth: string,
    sex: string,
}

export interface StaffModel {
    id?: string,
    name: string,
    licNo: string
}

export interface PatientRecordModel {
    id?: string,
    date: string,
    patient: PatientModel,
    pathologist: StaffModel,
    performedBy: StaffModel,
    verifiedBy: StaffModel,
    specNo: string,
    accessionNo: string,
    orderingDoctor: string,
    status: string,
    specimen: string,
    ordered: string,
    collectionDateTime: string,
    receivedDateTime: string,
    comments: string
    data: string
    mode: TemplateMode
}

export enum TemplateMode {
    TEMPLATE_MODE = "TEMPLATE_MODE",
    RICH_TEXT_MODE = "RICH_TEXT_MODE",
    SPREADSHEET_MODE = "SPREADSHEET_MODE",
}

export interface Pagination<T> {
    pageNumber: number,
    pageSize: number,
    content: T[],
    numberOfElements?: number,
    totalPages: number,
    totalElements: number,
    empty?: boolean
    pageable: {
        offset: number,
        pageNumber: number,
        pageSize: number
    },
    sortKeys?: string[],
    sortOrder?: "asc" | "desc"
}

export interface AuthModel {
    family_name: string,
    given_name: string,
    email: string,
    realm_access: {
        roles: string[]
    }
}