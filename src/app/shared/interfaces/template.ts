export interface TemplateModel {
    name: string;
    id: string;
    values: {
        column: { name: string, type: string, defaults: string } [];
        rows: string[][];
    };
}