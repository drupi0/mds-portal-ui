import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbModule, NgbDatepickerModule, NgbModal, NgbModalModule, NgbAlertModule, NgbPopoverModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi
} from '@angular/common/http';

import { AppComponent } from './app.component';
import { FormLoaderComponent } from './form-loader/form-loader.component';
import { FormWizardComponent } from './form-loader/form-wizard/form-wizard.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { BreadcrumbsComponent } from './navigator/breadcrumbs/breadcrumbs.component';
import { NavigatorComponent } from './navigator/navigator.component';
import { TemplateCreatorComponent } from './template-creator/template-creator.component';
import { TemplateModalComponent } from './form-loader/template-modal/template-modal.component';
import { IconsComponent } from './shared/components/icons/icons.component';
import { StaffModalComponent } from './form-loader/staff-modal/staff-modal.component';

import { NgxNotificationModule } from 'ngx-notification';
import { YesNoModalComponent } from './shared/components/yes-no-modal/yes-no-modal.component';
import { PrintformComponent } from './form-loader/printform/printform.component';
import { DatetimepickerComponent } from './shared/components/datetimepicker/datetimepicker.component';

const appRoutes: Routes = [{
  path: "login",
  component: LoginComponent
},
{
  path: "form",
  data: {
    breadcrumb: "Form"
  },
  children: [
    {
      path: "",
      component: FormLoaderComponent,
      data: {
        breadcrumb: "Patient's Records Home"
      }
    },
    {
      path: "new",
      component: FormWizardComponent,
      data: {
        breadcrumb: "New Patient Record"
      }
    },
    {
      path: ":formId",
      component: FormWizardComponent,
      data: {
        breadcrumb: "Edit Patient Record"
      }
    }
  ]
}, {
  path: "",
  redirectTo: "form",
  pathMatch: "full"
}]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    TemplateCreatorComponent,
    FormLoaderComponent,
    NavigatorComponent,
    BreadcrumbsComponent,
    FormWizardComponent,
    TemplateModalComponent,
    IconsComponent,
    StaffModalComponent,
    YesNoModalComponent,
    PrintformComponent,
    DatetimepickerComponent
  ],
  imports: [
    BrowserModule,
    NgbModule, RouterModule.forRoot(appRoutes),
    NgbDropdownModule,
    NgbDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModalModule,
    NgbAlertModule,
    NgbPopoverModule,
    NgbPaginationModule,
    NgxNotificationModule
  ],
  providers: [
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([
        (req, next) => {
          return next(req);
        },
      ])
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
