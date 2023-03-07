import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { NgxNotificationModule } from 'ngx-notification';
import { NgScrollbarModule } from 'ngx-scrollbar';
import {DragDropModule} from '@angular/cdk/drag-drop'; 

import { HttpClient, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import {
  NgbAlertModule, NgbDatepickerModule, NgbDropdownModule, NgbModalModule, NgbModule,
  NgbPaginationModule, NgbPopoverModule
} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard';
import { FormLoaderComponent } from './form-loader/form-loader.component';
import { FormWizardComponent } from './form-loader/form-wizard/form-wizard.component';
import { PrintformComponent } from './form-loader/printform/printform.component';
import { StaffModalComponent } from './form-loader/staff-modal/staff-modal.component';
import { TemplateModalComponent } from './form-loader/template-modal/template-modal.component';
import { initializeKeycloak } from './keycloak-init.factory';
import { BreadcrumbsComponent } from './navigator/breadcrumbs/breadcrumbs.component';
import { NavigatorComponent } from './navigator/navigator.component';
import {
  DatetimepickerComponent
} from './shared/components/datetimepicker/datetimepicker.component';
import { IconsComponent } from './shared/components/icons/icons.component';
import { YesNoModalComponent } from './shared/components/yes-no-modal/yes-no-modal.component';
import { TemplateCreatorComponent } from './template-creator/template-creator.component';

const appRoutes: Routes = [
  {
    path: "form",
    canActivate: [AuthGuard],
    data: {
      breadcrumb: "Patient's Records Home"
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
    KeycloakAngularModule,
    NgScrollbarModule,
    DragDropModule
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
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
