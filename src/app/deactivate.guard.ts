import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, delay } from 'rxjs';
import { FormWizardComponent } from './form-loader/form-wizard/form-wizard.component';

@Injectable({
  providedIn: 'root'
})
export class DeactivateGuard implements CanDeactivate<FormWizardComponent> {
  canDeactivate(
    component: FormWizardComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return component.onExit();
  }
  
}
