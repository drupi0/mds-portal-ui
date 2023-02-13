import { FieldType } from "./form";

export interface TemplateModel {
    name: string;
    id: string;
    group: {
        name: string,
        type: FieldType,
        defaults: string,
        values: string[]
    }[];
}
export interface PatientModel {
    id?: number
    name: string,
    dateOfBirth: string,
    sex: string,
}

export interface DoctorModel {
    id: number,
    name: string,
    licNo: string
}

export interface PatientRecordModel {
    date: string,
    patient: PatientModel,
    pathologist: DoctorModel,
    performedBy: DoctorModel,
    verifiedBy: DoctorModel,
    specNo: string,
    orderingDoctor: string,
    status: string,
    specimen: string,
    ordered: string,
    collectionDateTime: string,
    receivedDateTime: string,
    comments: string
    results: TemplateModel[]
}