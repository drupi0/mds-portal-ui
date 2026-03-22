import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import flatpickr from 'flatpickr';
import { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import { Options as FlatpickrOptions } from 'flatpickr/dist/types/options';

@Component({
  selector: 'mds-datetimepicker',
  standalone: false,
  templateUrl: './datetimepicker.component.html',
  styleUrls: ['./datetimepicker.component.scss'],
})
export class DatetimepickerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() id: string | undefined;

  @Input() date: string | number | null | undefined;

  @Input() showTime = true;
  @Input() showToggle = true;
  @Input() minDate: NgbDateStruct = {} as NgbDateStruct;

  @ViewChild('pickerInput') pickerInput?: ElementRef<HTMLInputElement>;

  @Output() onChange: EventEmitter<string> = new EventEmitter();

  private picker?: FlatpickrInstance;
  private viewReady = false;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.viewReady && this.pickerInput?.nativeElement) {
      this.initializePicker();
      return;
    }

    if (!this.viewReady || !this.picker) {
      return;
    }

    if (changes['showTime'] || changes['minDate']) {
      this.initializePicker();
      return;
    }

    if (changes['date']) {
      this.syncPickerValue();
    }
  }

  ngAfterViewInit() {
    this.initializePicker();
  }

  ngOnDestroy() {
    this.picker?.destroy();
  }

  togglePicker() {
    this.picker?.toggle();
  }

  syncManualValue() {
    const value = this.pickerInput?.nativeElement.value?.trim() || '';

    if (!value.length) {
      this.onChange.emit('');
      return;
    }

    this.picker?.setDate(value, true, this.formatPattern);
  }

  private initializePicker() {
    const input = this.pickerInput?.nativeElement;
    if (!input) {
      return;
    }

    this.picker?.destroy();

    const config: FlatpickrOptions = {
      allowInput: true,
      clickOpens: true,
      enableTime: this.showTime,
      time_24hr: this.showTime,
      dateFormat: this.formatPattern,
      defaultDate: this.normalizedDate,
      minDate: this.normalizedMinDate,
      onChange: (_, dateStr) => this.onChange.emit(dateStr || ''),
      onClose: (_, dateStr) => this.onChange.emit(dateStr || '')
    };

    this.picker = flatpickr(input, config);
    this.viewReady = true;
    this.syncPickerValue();
  }

  private syncPickerValue() {
    if (!this.picker) {
      return;
    }

    if (!this.normalizedDate) {
      this.picker.clear();
      return;
    }

    this.picker.setDate(this.normalizedDate, false, this.formatPattern);
  }

  private get normalizedDate(): string | Date | undefined {
    if (this.date === null || this.date === undefined || this.date === '') {
      return undefined;
    }

    if (typeof this.date === 'number') {
      const dateObj = new Date(this.date);
      return Number.isNaN(dateObj.getTime()) ? undefined : dateObj;
    }

    return this.date;
  }

  private get normalizedMinDate(): Date | undefined {
    if (!this.minDate?.year || !this.minDate?.month || !this.minDate?.day) {
      return undefined;
    }

    return new Date(this.minDate.year, this.minDate.month - 1, this.minDate.day);
  }

  private get formatPattern() {
    return this.showTime ? 'm/d/Y H:i' : 'm/d/Y';
  }
}
