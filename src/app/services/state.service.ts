import { BehaviorSubject } from 'rxjs';

import { Injectable } from '@angular/core';

import { Action, AppState } from '../shared/interfaces/state';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  appState: AppState = {
    formList: [],
    templateList: [],
    breadcrumbs: []
  }

  appState$: BehaviorSubject<AppState> = new BehaviorSubject({
    formList: [],
    templateList: [],
    breadcrumbs: []
  } as AppState);

  dispatch(action: Action, state: AppState) {
    switch (action) {
      case Action.ADD_FORM:
        this.appState.formList.push(...state.formList);
        break;
      case Action.PUSH_BREADCRUMB:
        this.appState.breadcrumbs.push(...state.breadcrumbs);
        break;
      case Action.POP_BREADCRUMB:
        this.appState.breadcrumbs.pop();
        break;
      case Action.CLEAR_BREADCRUMB:
        this.appState.breadcrumbs = [];
        break;
    }

    this.appState$.next(this.appState);
  }

  constructor() { }
}
