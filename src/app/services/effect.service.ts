import { filter, map, Observable, Subject, tap } from 'rxjs';
import { FormModel } from 'src/app/interfaces/form';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationStart, NavigationEnd, Router } from '@angular/router';

import { Action, AppState, BreadcrumbItem, DefaultRoutes } from '../interfaces/state';
import { TemplateModel } from '../interfaces/template';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class EffectService {

  activeTab$: Subject<string> = new Subject();

  constructor(private store: StateService, private router: Router) { }

  get formList(): Observable<FormModel[]> {
    return this.store.appState$.asObservable().pipe(map((state: AppState) => state.formList));
  }

  get templateList(): Observable<TemplateModel[]> {
    return this.store.appState$.asObservable().pipe(map((state: AppState) => state.templateList));
  }

  get breadcrumbs(): Observable<BreadcrumbItem[]> {
    return this.store.appState$.asObservable().pipe(map((state: AppState) => state.breadcrumbs));
  }

  openFormWizard(formId?: string) {

    if (!formId) {
      this.router.navigateByUrl("/form/new");
    }

  }

  initBreadcrumbs() {
    this.router.events.pipe(filter(event => event instanceof ActivationStart)).subscribe((event) => {
      const activationEvent: ActivationStart = event as ActivationStart;
      const { breadcrumb } = activationEvent.snapshot.data;
      let href = this.getResolvedUrl(activationEvent.snapshot);
      href = href.endsWith("/") ? href.slice(0, -1) : href;

      if (DefaultRoutes.some(route => route.href === href)) {
        this.store.dispatch(Action.CLEAR_BREADCRUMB, {} as AppState);
      }

      if (breadcrumb) {
        const newItem: BreadcrumbItem = {
          title: breadcrumb,
          href
        }

        this.store.dispatch(Action.PUSH_BREADCRUMB, {
          breadcrumbs: [newItem]
        } as AppState);

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
