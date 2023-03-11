import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { BreadcrumbService } from './services/breadcrumb.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {
  
  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService, private breadCrumbSvc: BreadcrumbService
  ) {
    super(router, keycloak);
  }
  
  async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.origin + state.url,
      });
    }

    route.data = {
      ...route.data,
      isAdmin: this.breadCrumbSvc.isAdmin(),
      isSuperAdmin: this.breadCrumbSvc.isSuperAdmin()
    }

    return this.authenticated;
  }
}