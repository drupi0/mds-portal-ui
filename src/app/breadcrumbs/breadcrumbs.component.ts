

import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { AuthModel } from 'src/app/shared/interfaces/template';
import { environment } from 'src/environments/environment';

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

  accountSettings() {
    const { AUTH_REALM, AUTH_URL } = environment;
    window.location.replace(`${AUTH_URL}/realms/${AUTH_REALM}/account`);
    // window.location.replace("/auth/realms/mds-auth/account/");
  }
}
