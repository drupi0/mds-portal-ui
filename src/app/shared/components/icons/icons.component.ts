import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewRef } from '@angular/core';

@Component({
  selector: 'mds-icons',
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.scss']
})
export class IconsComponent implements OnChanges {
  @Input() icon: string = ""
  @Input() width: number = 25;
  @Input() height: number = 25;
  @Input() classList: string = "";

  iconWidth: number = 0;
  iconHeight: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.iconHeight = this.height;
    this.iconWidth = this.width;
  }
}
