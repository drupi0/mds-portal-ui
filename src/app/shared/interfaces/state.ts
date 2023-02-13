import { FormModel } from './form';
import { TemplateModel } from './template';

export enum Action {
    ADD_FORM = "[Form] Add new form",
    UPDATE_FORM = "[Form] Update form",
    DELETE_FORM = "[Form] Delete form",
    ADD_TEMPLATE = "[Template] Add new template",
    UPDATE_TEMPLATE = "[Template] Update template",
    DELETE_TEMPLATE = "[Template] Delete template",
    PUSH_BREADCRUMB = "[Breadcrumbs] Push breadcrumb item",
    POP_BREADCRUMB = "[Breadcrumbs] Pop last breadcrumb item",
    CLEAR_BREADCRUMB = "[Breadcrumbs] Clear all items on breadcrumb"
}

export interface BreadcrumbItem {
    title: string,
    href: string
}

export interface AppState {
    formList: FormModel[],
    templateList: TemplateModel[]
    breadcrumbs: BreadcrumbItem[]
}

export const DefaultRoutes: BreadcrumbItem[] = [
    { title: 'Forms', href: '/form' },
];