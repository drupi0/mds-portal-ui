import { Component, Input, OnInit, ViewChild, ViewRef } from '@angular/core';

@Component({
  selector: 'mds-icons',
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.scss']
})
export class IconsComponent {
  @Input() icon: string = ""
  @Input() width: number = 24;
  @Input() height: number = 24;
}
