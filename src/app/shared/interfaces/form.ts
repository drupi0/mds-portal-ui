export interface FormModel {
    id: string,
    name: string,
    date: Date,
    templateId: string,
    values: string
}

export enum FieldType {
    DEFAULT = "SELECT TYPE",
    TEXT = "TEXT",
    NUMBER = "NUMBER",
    DATE = "DATE",
    DATETIME = "DATETIME",
    DROPDOWN = "DROPDOWN"
}