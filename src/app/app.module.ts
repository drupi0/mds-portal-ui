import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { FormLoaderComponent } from './form-loader/form-loader.component';
import { FormWizardComponent } from './form-loader/form-wizard/form-wizard.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { BreadcrumbsComponent } from './navigator/breadcrumbs/breadcrumbs.component';
import { NavigatorComponent } from './navigator/navigator.component';
import { TemplateCreatorComponent } from './template-creator/template-creator.component';

const appRoutes: Routes = [{
  path: "login",
  component: LoginComponent
},
{
  path: "home",
  component: HomeComponent,
  data: {
    breadcrumb: "Home"
  }
},
{
  path: "template",
  component: TemplateCreatorComponent,
  data: {
    breadcrumb: "Templates"
  }
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
        breadcrumb: "Form"
      }
    },
    {
      path: "new",
      component: FormWizardComponent,
      data: {
        breadcrumb: "New Form"
      }
    }
  ]
}, {
  path: "",
  redirectTo: "home",
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
    FormWizardComponent
  ],
  imports: [
    BrowserModule,
    NgbModule, RouterModule.forRoot(appRoutes),
    NgbDropdownModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
