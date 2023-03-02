import { APP_INITIALIZER, NgModule } from '@angular/core';
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
import { initializeKeycloak } from './keycloak-init.factory';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { AuthGuard } from './auth.guard';

const appRoutes: Routes = [
{
  path: "form",
  canActivate: [AuthGuard],
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
    NgxNotificationModule,
    KeycloakAngularModule
  ],
  providers: [
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([
        (req, next) => {
          return next(req);
        },
      ])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
