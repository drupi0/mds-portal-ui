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
    DATETIME = "DATETIME",
    DROPDOWN = "DROPDOWN"
  }