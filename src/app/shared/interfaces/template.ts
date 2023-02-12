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
    id: number
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    sex: string,
}

export interface DoctorModel {
    id: number,
    name: string,
    licNo: string
}

export interface PatientRecord {
    date: string,
    patient: PatientModel,
    pathologist: DoctorModel,
    performedBy: DoctorModel,
    verifiedBy: DoctorModel,
    details: {
        specNo: string,
        orderingDoctor: string,
        status: string,
        specimen: string,
        ordered: string,
        collectionDateTime: string,
        receivedDateTime: string,
        comments: string
    },
    results: TemplateModel[]
}