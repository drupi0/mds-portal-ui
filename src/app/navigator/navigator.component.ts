
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbService } from '../services/breadcrumb.service';
import { DefaultRoutes } from '../shared/interfaces/state';
import { AuthModel } from '../shared/interfaces/template';

@Component({
  selector: 'mds-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss'],
})
export class NavigatorComponent implements OnInit {
  links = DefaultRoutes;
  currentUser: AuthModel = {} as AuthModel

  ngOnInit(): void {
    this.breadcrumbSvc.initBreadcrumbs();
    console.log(this.breadcrumbSvc.getRoles());

    this.breadcrumbSvc.getToken().subscribe(auth => {
      this.currentUser = auth;
    })
    
  }

  logout() {
    this.breadcrumbSvc.logout();
  }

  constructor(public router: Router, public breadcrumbSvc: BreadcrumbService) {

  }
}
