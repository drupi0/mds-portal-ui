import { BehaviorSubject, filter } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { DefaultRoutes } from '../interfaces/state';
import { EffectService } from '../services/effect.service';

@Component({
  selector: 'mds-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss'],
})
export class NavigatorComponent implements OnInit {
  links = DefaultRoutes;

  ngOnInit(): void {
    this.effect.initBreadcrumbs();
  }

  constructor(public router: Router, public effect: EffectService) {

  }
}
