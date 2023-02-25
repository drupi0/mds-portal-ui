import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgbDateStruct, NgbDropdown, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'mds-datetimepicker',
  templateUrl: './datetimepicker.component.html',
  styleUrls: ['./datetimepicker.component.scss']
})
export class DatetimepickerComponent implements OnChanges, OnInit {
  @Input() date: string = "";
  @Input() time: string = "";
  @Input() showTime: boolean = true;
  @Input() minDate: NgbDateStruct = {} as NgbDateStruct;

  timeObj: NgbTimeStruct = {} as NgbTimeStruct;
  dateObj: NgbDateStruct = {} as NgbDateStruct;

  @Output() onChange: EventEmitter<string> = new EventEmitter();

  ngOnInit() {
    // this.initDateTime();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { time, date, showTime, minDate } = changes;

    if(time) {
      this.time = time?.currentValue;
    }

    if(date) {
      this.date = date?.currentValue;
    }

    if(showTime){
      this.showTime = showTime?.currentValue;
    }

    if(minDate) {
      this.minDate = minDate?.currentValue;
    }
    
    if(time) {
      this.time = time?.currentValue;
    }

    this.initDateTime();
  }

  private initDateTime() {
    const currentDt = new Date();

    if(!Object.keys(this.minDate).length) {
      this.minDate = {
        year: currentDt.getFullYear() - 10,
        month: 1,
        day: 1
      }
    }

    if(!this.time) {
      this.timeObj = {
        hour: currentDt.getHours(),
        minute: currentDt.getMinutes(),
        second: currentDt.getSeconds()
      }
    } else {
      const [hh, mm] = this.time.split(":");
      this.timeObj = {
        hour: parseInt(hh),
        minute: parseInt(mm),
        second: 0
      }
    }

    if(!this.date) {
      this.dateObj = {
        day: currentDt.getDate(),
        month: currentDt.getMonth() + 1,
        year: currentDt.getFullYear()
      }
    } else {
      const [mm, dd, yyyy] = this.date.split("/");
      this.dateObj = {
        day: parseInt(dd),
        month: parseInt(mm),
        year: parseInt(yyyy)
      }
    }
  }

  onDateSet(event: NgbDateStruct) {
    this.dateObj = event;
  }

  onTimeSet(event: NgbTimeStruct) {
    this.timeObj = event;
  }

  stringifyTime() {
    const { hour, minute } = this.timeObj;
    return `${hour}:${minute}`;
  }

  stringifyDate() {
    const { day, month, year } = this.dateObj;
    return `${day}/${month}/${year}`;
  }

  set(dp: NgbDropdown, isCancelled: boolean = false) {
    if(isCancelled) {
      this.initDateTime();
    } else {
      const { hour, minute } = this.timeObj;
      const { day, month, year } = this.dateObj;
  
      let dateString = `${day}/${month}/${year}`

      if(this.showTime) {
        dateString = dateString.concat(` ${hour}:${minute}`);
      }

      this.onChange.next(dateString);
    }

    dp.close();
  }

  constructor(){}
}
