export interface TemplateModel {
    name: string;
    id: string;
    values: {
        column: string[];
        rows: string[][];
    };
}