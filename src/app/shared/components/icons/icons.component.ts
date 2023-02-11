import { Component, Input } from '@angular/core';

@Component({
  selector: 'mds-icons',
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.scss']
})
export class IconsComponent {
  @Input() icon: string = ""
}
