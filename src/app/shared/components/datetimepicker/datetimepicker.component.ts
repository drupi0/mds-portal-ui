import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { NgbDateStruct, NgbDropdown, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'mds-datetimepicker',
  templateUrl: './datetimepicker.component.html',
  styleUrls: ['./datetimepicker.component.scss'],
})
export class DatetimepickerComponent implements OnChanges {
  @Input() id: string | undefined;

  @Input() date: string | undefined;

  @Input() showTime: boolean = true;
  @Input() minDate: NgbDateStruct = {} as NgbDateStruct;

  @ViewChild("dp") dp: NgbDropdown | undefined;

  dateModel: string = "";
  timeModel: NgbTimeStruct = {} as NgbTimeStruct;
  dateTimeModel: string = "";

  @Output() onChange: EventEmitter<string> = new EventEmitter();

  ngOnChanges() {
    if (!this.date) {
      return;
    }

    const dateStr = this.date?.split(" ");
    if (dateStr?.length <= 1) {
      this.setDate(dateStr[0]);
      return;
    }

    this.setTime(dateStr[1]);
    this.setDate(dateStr[0]);

    this.updateValue(false);
  }

  onDateSet(dateObj: string) {
    if(!dateObj) {
      this.onChange.emit("");  
      return;
    }

    if(!dateObj.length) {
      this.onChange.emit("");  
      return;
    }

    const dateSplit = dateObj.split("/");
    if(dateSplit.length < 3 || dateSplit[2].startsWith("0")) {
      this.onChange.emit("");
      return;
    }

    this.setDate(dateObj);
  }

  onTimeSet(timeObj: NgbTimeStruct) {
    this.setTime(`${String(timeObj.hour).padStart(2, "0")}:${String(timeObj.minute).padStart(2, "0")}`);
  }

  updateValue(isOpen: boolean) {
    if (isOpen) {
      return;
    }

    if(this.showTime && !this.timeModel.hour && !this.timeModel.minute) {
      return;
    }

    this.dateTimeModel = `${this.dateModel} ${String(this.timeModel.hour).padStart(2, "0")}:${String(this.timeModel.minute).padStart(2, "0")}`;

    this.onChange.emit(this.dateTimeModel);
  }

  validateDateTime(dateTimeStr: string) {
    const dtSplit = dateTimeStr.split(" ");

    if (dtSplit.length <= 1) {
      this.onChange.emit("");
      return;
    }

    const timeSplit = dtSplit[1].split(":"); 

    if(timeSplit.length <= 1) {
      this.onChange.emit("");
      return;
    }

    if(timeSplit[0].length !== 2 || timeSplit[1].length !== 2) {
      this.onChange.emit("");
      return;
    }

    this.setDate(dtSplit[0]);
    this.setTime(dtSplit[1]);
   
    this.updateValue(false);
  }

  private setDate(dateStr: string) {
    console.log(dateStr)
    if(isNaN(Date.parse(dateStr))) {
      return;
    }
    
    const dateObj = new Date(dateStr);
    this.dateModel = `${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getFullYear()).padStart(4, "0")}`;

    if (!this.showTime) {
      this.onChange.emit(this.dateModel);
      return;
    }
  }

  private setTime(timeStr: string) {
    const hhMM = timeStr.split(":");

    try {
      if (hhMM.length <= 1) {
        throw new Error("Invalid Time");
      }

      this.timeModel = {
        hour: parseInt(hhMM[0], 10),
        minute: parseInt(hhMM[1], 10),
        second: 0
      }
    } catch (e) {
      const currentTime = new Date();
      this.timeModel = {
        hour: currentTime.getHours(),
        minute: currentTime.getMinutes(),
        second: currentTime.getSeconds()
      }
    }
  }

  constructor() { }
}