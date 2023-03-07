import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbDateStruct, NgbDropdown, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'mds-datetimepicker',
  templateUrl: './datetimepicker.component.html',
  styleUrls: ['./datetimepicker.component.scss']
})
export class DatetimepickerComponent implements OnChanges {
  @Input() date: string | undefined;
  @Input() id: string | undefined;

  @Input() showTime: boolean = true;
  @Input() minDate: NgbDateStruct = {} as NgbDateStruct;

  @ViewChild("dp") dp : NgbDropdown | undefined;

  timeObj: NgbTimeStruct = {} as NgbTimeStruct;
  dateObj: NgbDateStruct = {} as NgbDateStruct;

  @Output() onChange: EventEmitter<string> = new EventEmitter();

  currentDateTime: BehaviorSubject<string> = new BehaviorSubject(`MM/DD/YYYY${ this.showTime ? ' HH:MM' : ''}`);

  ngOnChanges() {
    const currentDt = new Date();

    this.timeObj = {
      hour: currentDt.getHours(),
      minute: currentDt.getMinutes(),
      second: currentDt.getSeconds()
    }

    this.dateObj = {
      day: currentDt.getDate(),
      month: currentDt.getMonth() + 1,
      year: currentDt.getFullYear()
    }

    this.initDateTime();
  }


  private initDateTime() {
    if (!this.date) {
      return;
    }

    const dateStr = this.showTime ? this.date.split(" ")[0] : this.date;

    const [mm, dd, yyyy] = dateStr.split("/");

    this.dateObj = {
      day: parseInt(dd),
      month: parseInt(mm),
      year: parseInt(yyyy)
    }

    if (this.showTime) {
      const timeStr = this.date.split(" ")[1];
      const [hh, mm] = timeStr.split(":");

      this.timeObj = {
        hour: parseInt(hh),
        minute: parseInt(mm),
        second: 0
      }
    }

    this.currentDateTime.next(this.stringifyDate().concat(this.showTime ? ` ${this.stringifyTime()}` : ""));
  }

  onDateSet(event: NgbDateStruct) {
    this.dateObj = event;
  }

  onTimeSet(event: NgbTimeStruct) {
    this.timeObj = event;
  }

  stringifyTime() {
    const { hour, minute } = this.timeObj;
    return `${this.doublePadding(hour)}:${this.doublePadding(minute)}`;
  }

  stringifyDate() {
    const { day, month, year } = this.dateObj;
    return `${this.doublePadding(month)}/${this.doublePadding(day)}/${year}`;
  }

  private doublePadding(numParam: number): string {
    return (numParam).toLocaleString(undefined, { minimumIntegerDigits: 2 });
  }

  set(isCancelled: boolean = false, isReset: boolean = false) {
    if (isCancelled) {
      this.initDateTime();
      this.dp?.close();

      return;
    }

    if (isReset) {
      this.currentDateTime.next(`MM/DD/YYYY${ this.showTime ? ' HH:MM' : ''}`);
      this.onChange.next("");

      this.dp?.close();

      return;
    }

    const { hour, minute } = this.timeObj;
    const { day, month, year } = this.dateObj;

    let dateString = `${this.doublePadding(month)}/${this.doublePadding(day)}/${year}`

    if (this.showTime) {
      dateString = dateString.concat(` ${this.doublePadding(hour)}:${this.doublePadding(minute)}`);
    }

    this.onChange.next(dateString);
    this.dp?.close()
  }

  constructor() { }
}
