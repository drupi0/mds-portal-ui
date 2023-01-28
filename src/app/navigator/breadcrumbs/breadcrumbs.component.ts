import { EffectService } from 'src/app/services/effect.service';

import { Component } from '@angular/core';

@Component({
  selector: 'mds-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent {
  constructor(public effect: EffectService) { }
}
