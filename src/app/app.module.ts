import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { NgxNotificationModule } from 'ngx-notification';
import { NgScrollbarModule } from 'ngx-scrollbar';

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
import { firstValueFrom } from 'rxjs';
import * as environment from 'src/environment'

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
    KeycloakAngularModule,
    NgScrollbarModule
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
    {
      provide: 'env',
      useFactory: (http: HttpClient) => firstValueFrom(http.get(`environment.json?t=${new Date().getTime()}`)),
      deps: [HttpClient]
    },
    {
      provide: 'environment',
      useFactory: (env: any) => {
        return { ...environment, ...env };
      },
      deps: ['env']
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
