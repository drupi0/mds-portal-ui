import { BehaviorSubject, filter, from, map, Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationStart, Router } from '@angular/router';

import { KeycloakService } from 'keycloak-angular';
import { BreadcrumbItem, DefaultRoutes } from 'src/app/shared/interfaces/state';
import { AuthModel } from '../shared/interfaces/template';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  activeTab$: Subject<string> = new Subject();
  breadCrumbs$: BehaviorSubject<BreadcrumbItem[]> = new BehaviorSubject([] as BreadcrumbItem[]);

  constructor(private router: Router, private authSvc: KeycloakService) { }

  getUser() {
    return this.authSvc.getUsername();
  }

  getRoles() {
    return this.authSvc.getUserRoles();
  }

  getToken(): Observable<AuthModel> {
    return from(this.authSvc.getToken()).pipe(map(tokenStr => {
      if(tokenStr) {
        const data: AuthModel = JSON.parse(window.atob(tokenStr.split('.')[1]));
        return data;
      }

      return {} as AuthModel
    }));
  }

  isAdmin() {
    return this.getToken().pipe(map(token => token.realm_access.roles.includes("admin")));
  }

  isSuperAdmin() {
    return this.getToken().pipe(map(token => token.realm_access.roles.includes("super_admin")));
  }

  get breadcrumbs(): Observable<BreadcrumbItem[]> {
    return this.breadCrumbs$;
  }

  logout() {
    this.authSvc.logout();
  }

  openFormWizard(formId?: string) {
    if (!formId) {
      this.router.navigateByUrl("/form");
    }

  }

  get current(): BreadcrumbItem {
    const breadcrumbItems: BreadcrumbItem[] = this.breadCrumbs$.getValue();
    return breadcrumbItems[breadcrumbItems.length - 1];
  }

  initBreadcrumbs() {
    this.router.events.pipe(filter(event => event instanceof ActivationStart)).subscribe((event) => {
      const activationEvent: ActivationStart = event as ActivationStart;
      const { breadcrumb } = activationEvent.snapshot.data;
      let href = this.getResolvedUrl(activationEvent.snapshot);
      href = href.endsWith("/") ? href.slice(0, -1) : href;

      if (DefaultRoutes.some(route => route.href === href)) {
        this.breadCrumbs$.next([]);
      }

      if (breadcrumb) {
        const newItem: BreadcrumbItem = {
          title: breadcrumb,
          href
        }

        const currentBreadCrumbs = this.breadCrumbs$.getValue();
        currentBreadCrumbs.push(newItem);
        this.breadCrumbs$.next(currentBreadCrumbs);

        this.activeTab$.next(href);
      }

    });
  }

  private getResolvedUrl(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
      .map(v => v.url.map(segment => segment.toString()).join('/'))
      .join('/');
  }
}
