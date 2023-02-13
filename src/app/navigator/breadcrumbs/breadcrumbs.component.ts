

import { Component } from '@angular/core';
import { BreadcrumbEffectService } from 'src/app/services/effects/breadcrumb.effect.service';

@Component({
  selector: 'mds-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent {
  constructor(public effect: BreadcrumbEffectService) { }
}
