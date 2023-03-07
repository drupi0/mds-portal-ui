import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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

  @ViewChild("dtToggle")
  dtToggle: HTMLButtonElement | undefined;

  hasDateChange: boolean = false;

  ngOnInit() {
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

    this.date = `${this.doublePadding(this.dateObj.month)}/${this.doublePadding(this.dateObj.day)}/${this.dateObj.year}`;
    this.time = `${this.doublePadding(this.timeObj.hour)}:${this.doublePadding(this.timeObj.minute)}`
    
    this.initDateTime();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    const { date, time, showTime, minDate } = changes;

    if(time?.currentValue) {
      this.time = time?.currentValue;
      this.hasDateChange = true;
    }

    if(date?.currentValue) {
      this.date = date?.currentValue;
      this.hasDateChange = true;
    }

    if(showTime?.currentValue){
      this.showTime = showTime?.currentValue;
    }

    if(minDate?.currentValue) {
      this.minDate = minDate?.currentValue;
    }
    
    this.initDateTime();
  }

  private initDateTime() {
    
    if(this.time) {
      const [hh, mm] = this.time.split(":");
      this.timeObj = {
        hour: parseInt(hh),
        minute: parseInt(mm),
        second: 0
      }
    }

    if(this.date) {
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
    return `${this.doublePadding(hour)}:${this.doublePadding(minute)}`;
  }

  stringifyDate() {
    const { day, month, year } = this.dateObj;
    return `${this.doublePadding(month)}/${this.doublePadding(day)}/${year}`;
  }

  private doublePadding(numParam: number): string {
    return (numParam).toLocaleString(undefined, { minimumIntegerDigits: 2 });
  }

  set(dp: NgbDropdown | undefined, isCancelled: boolean = false, isReset: boolean = false) {
    if(isCancelled) {
      this.initDateTime();
    } else if(isReset) {
      this.date = "";
      this.time = "";
      this.hasDateChange = false;
      this.onChange.next("");
    } else {
      const { hour, minute } = this.timeObj;
      const { day, month, year } = this.dateObj;
  
      let dateString = `${this.doublePadding(month)}/${this.doublePadding(day)}/${year}`

      if(this.showTime) {
        dateString = dateString.concat(` ${this.doublePadding(hour)}:${this.doublePadding(minute)}`);
      }

      this.onChange.next(dateString);

      this.hasDateChange = true;
    }

    if(dp) {
      dp.close();
    }
    
  }

  constructor(){}
}
