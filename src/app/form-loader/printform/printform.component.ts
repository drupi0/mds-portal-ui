import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import html2canvas from "html2canvas";
import jsPDF, { jsPDFOptions } from "jspdf";
import { PatientRecordModel, TemplateModel } from 'src/app/shared/interfaces/template';

@Component({
  selector: 'mds-printform',
  templateUrl: './printform.component.html',
  styleUrls: ['./printform.component.scss']
})
export class PrintformComponent implements OnInit {
  
  constructor(public activeModal: NgbActiveModal, private calendar: NgbCalendar) {}

  @ViewChild('printArea', { static: false }) dataToExport: ElementRef | undefined;
  @Input() formData: PatientRecordModel | undefined;
  reportField: TemplateModel[] = [];

  ngOnInit(): void {
    if(this.formData?.data) {
      this.reportField = JSON.parse(this.formData?.data);
    }
  }

  downloadAsPdf(): void {
    if (!this.dataToExport) {
      return;
    }

    html2canvas(this.dataToExport.nativeElement).then((canvas) => {

      const imgData = canvas.toDataURL('image/png');

      let jsPdfOptions: jsPDFOptions = {
        orientation: "p",
        unit: "mm",
        format: [297, 210]
      };

      const pdf = new jsPDF(jsPdfOptions);

      const imgProps= pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      window.open(pdf.output('bloburl'), '_blank');
    });
  }

  dismiss() {
    this.activeModal.dismiss();
  }

  dateFormat(date: string | any) {
    const [year, month, day ] = date.split("-");

    return `${day}/${month}/${year}`;
  }

  calcAge(date: string | any) {
    const [year, month, day ] = date.split("-");
    const todayDate = this.calendar.getToday();
    let age = todayDate.year - parseInt(year);
    
    const monthDiff = todayDate.month - parseInt(month);
    if (monthDiff < 0 || (monthDiff === 0 && todayDate.day < parseInt(day))) {
      age--;
    }

    return `${age}`;
  }

}
