import { DragDropModule } from '@angular/cdk/drag-drop';
import { createInterceptorCondition, INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG, IncludeBearerTokenCondition, includeBearerTokenInterceptor, provideKeycloak } from 'keycloak-angular';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import {
  NgbAlertModule, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbDatepickerModule, NgbDropdownModule, NgbModalModule, NgbModule,
  NgbNavModule,
  NgbPaginationModule, NgbPopoverModule
} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { FormsTableComponent } from './components/forms-table/forms-table.component';
import { DeactivateGuard } from './deactivate.guard';
import { FormLoaderComponent } from './form-loader/form-loader.component';
import { FormWizardComponent } from './form-loader/form-wizard/form-wizard.component';
import { PrintformComponent } from './form-loader/printform/printform.component';
import { StaffModalComponent } from './form-loader/staff-modal/staff-modal.component';
import { TemplateModalComponent } from './form-loader/template-modal/template-modal.component';
import {
  DatetimepickerComponent
} from './shared/components/datetimepicker/datetimepicker.component';
import { IconsComponent } from './shared/components/icons/icons.component';
import { YesNoModalComponent } from './shared/components/yes-no-modal/yes-no-modal.component';
import { TemplateCreatorComponent } from './template-creator/template-creator.component';

import { provideAnimations } from '@angular/platform-browser/animations';


import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxEditorModule } from 'ngx-editor';
import { ToastrModule, provideToastr } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

const standaloneComponents = [FormsTableComponent]

const appRoutes: Routes = [
  {
    path: "form",
    canActivate: [AuthGuard],
    data: {
      breadcrumb: "Home"
    },
    children: [
      {
        path: "",
        component: FormLoaderComponent,
        data: {
          breadcrumb: "Home"
        }
      },
      {
        path: "new",
        component: FormWizardComponent,
        data: {
          breadcrumb: "New Record"
        },
        canDeactivate: [DeactivateGuard],
      },
      {
        path: ":formId",
        component: FormWizardComponent,
        data: {
          breadcrumb: "Edit Record"
        },
        canDeactivate: [DeactivateGuard],
      }
    ]
  }, {
    path: "",
    redirectTo: "form",
    pathMatch: "full"
  }]


const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: new RegExp(`^(${environment.API_URL.replace(/\//g, '\/')})(\/.*)?$`, 'i'),
  bearerPrefix: 'Bearer'
});



@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {
  readonly DELIMITER = '/';

  fromModel(value: string): NgbDateStruct | null {
    if (!value || !value.length) {
      return null;
    }

    const date = value.split(this.DELIMITER);
    return {
      month: parseInt(date[0], 10),
      day: parseInt(date[1], 10),
      year: parseInt(date[2], 10)
    }
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date ? String(date.month).padStart(2, "0") + this.DELIMITER + String(date.day).padStart(2, "0") + 
            this.DELIMITER + String(date.year).padStart(4, "0") : null;
  }
}


@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (!value || !value.length) {
      return null;
    }

    const date = value.split(this.DELIMITER);

    return {
      month: parseInt(date[0], 10),
      day: parseInt(date[1], 10),
      year: parseInt(date[2], 10)
    }
  }

  format(date: NgbDateStruct | null): string {
    return date ? String(date.month).padStart(2, "0") + this.DELIMITER + String(date.day).padStart(2, "0") + 
            this.DELIMITER + String(date.year).padStart(4, "0") : '';
  }
}

@NgModule({
  declarations: [
    AppComponent,
    TemplateCreatorComponent,
    FormLoaderComponent,
    BreadcrumbsComponent,
    FormWizardComponent,
    TemplateModalComponent,
    IconsComponent,
    StaffModalComponent,
    YesNoModalComponent,
    PrintformComponent,
    DatetimepickerComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule, RouterModule.forRoot(appRoutes, {
      scrollPositionRestoration: 'enabled'
    }),
    NgbDropdownModule,
    NgbDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModalModule,
    NgbAlertModule,
    NgbPopoverModule,
    NgbPaginationModule,
    PdfViewerModule,
    NgScrollbarModule,
    NgbNavModule,
    DragDropModule,
    ...standaloneComponents,
    PdfViewerModule,
    NgxEditorModule.forRoot({
      locals: {
        bold: 'Bold',
        italic: 'Italic',
        code: 'Code',
        underline: 'Underline',
      },
    }),
    ToastrModule.forRoot()
  ],
  providers: [
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([
        (req, next) => {
          return next(req);
        },
        includeBearerTokenInterceptor
      ])
    ),
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
    provideKeycloak({
      config: {
        url: environment.AUTH_URL,
        realm: environment.AUTH_REALM,
        clientId: environment.AUTH_CLIENT
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
      },
    }),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [urlCondition]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


