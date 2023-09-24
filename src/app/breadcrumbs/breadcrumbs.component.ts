

import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { AuthModel } from 'src/app/shared/interfaces/template';

@Component({
  selector: 'mds-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  constructor(public breadcrumbSvc: BreadcrumbService) { }
  
  currentUser: AuthModel = {} as AuthModel

  get userName(): string {
    return `${this.currentUser.given_name || "User" }`;
  }

  ngOnInit(): void {
    this.breadcrumbSvc.initBreadcrumbs();

    this.breadcrumbSvc.getToken().subscribe(auth => {
      this.currentUser = auth;
    })
  }

  logout() {
    this.breadcrumbSvc.logout();
  }
}
