import * as htmlToImage from 'html-to-image';
import jsPDF, { jsPDFOptions } from 'jspdf';
import { forkJoin, from, Observable } from 'rxjs';
import { PatientRecordModel, TemplateModel } from 'src/app/shared/interfaces/template';

import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgbActiveModal, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';

const PAPER_HEIGHT = 1700;
@Component({
  selector: 'mds-printform',
  templateUrl: './printform.component.html',
  styleUrls: ['./printform.component.scss']
})
export class PrintformComponent implements OnInit, AfterViewInit {

  constructor(public activeModal: NgbActiveModal, private calendar: NgbCalendar, private renderer: Renderer2, private sanitize: DomSanitizer) { }

  @ViewChild('printArea', { static: false }) dataToExport: ElementRef | undefined;
  @ViewChild('formattedArea', { static: false }) formattedArea: ElementRef | undefined;
  @Input() formData: PatientRecordModel | undefined;
  reportField: TemplateModel[] = [];

  formattedPage: SafeHtml = "";
  isPrinting: boolean = false;
  isDocumentLoaded = false;
  printNow: boolean = false;

  separateReports: boolean = false;
  printHeaderOnSeparateReports = false;
  printFooterOnSeparateReports = false;
  reportZoom = 1.5;

  pdfSrc: any;

  ngOnInit(): void {
    if (this.formData?.data) {
      this.reportField = JSON.parse(this.formData?.data);
      setTimeout(() => {
        this.previewAsPDF();
      }, 100);
    }
  }

  ngAfterViewInit(): void {
    if (this.printNow) {
      setTimeout(() => {
        this.previewAsPDF();
      }, 100);
    }
  }

  previewAsPDF(): void {
    if(this.isDocumentLoaded) {
      this.printDocument();
      return;
    }

    if (!this.dataToExport) {
      return;
    }

    this.isPrinting = true;

    const elements: HTMLElement[] = this.dataToExport.nativeElement.getElementsByClassName("main-row");
    let pageGroup: HTMLElement[] = [];
    const groups: any = [];
    let totalHeight = 0;

    Array.from(elements).forEach(row => {
      if (totalHeight + row.getBoundingClientRect().height >= PAPER_HEIGHT) {
        groups.push(pageGroup);
        pageGroup = [];
        totalHeight = 0;
      }

      pageGroup.push(row);
      totalHeight += row.getBoundingClientRect().height;
    });

    groups.push(pageGroup);

    let canvasElements: Observable<HTMLCanvasElement>[] = [];

    groups.forEach(async (divGroups: HTMLElement[]) => {
      const group = document.createElement("div");
      group.classList.add("p-4", "border-0", "bg-white");

      divGroups.forEach(g => {
        this.renderer.appendChild(group, g.cloneNode(true));
      });

      this.renderer.appendChild(this.formattedArea?.nativeElement, group);
      canvasElements.push(from(htmlToImage.toCanvas(group, {
        pixelRatio: 3,
      })))
    });

    forkJoin(canvasElements).subscribe(canvasList => {
      if (this.formattedArea?.nativeElement) {
        this.formattedArea.nativeElement.hidden = true;
      }

      let jsPdfOptions: jsPDFOptions = {
        orientation: "p",
        unit: "mm",
        format: [297, 210],
      };

      const pdf = new jsPDF(jsPdfOptions);

      canvasList.forEach((canvas, index) => {
        const imgData = canvas.toDataURL('image/jpeg');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(canvas, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        if (index < canvasList.length - 1) {
          pdf.addPage();
        }
      });

      this.pdfSrc = pdf.output("bloburl");
    });
  }


  printDocument() {
    if(navigator.userAgent.includes("Chrome")) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = this.pdfSrc;
      document.body.appendChild(iframe);
      iframe?.contentWindow?.print();

      return;
    }

    window.open(this.pdfSrc, "_blank");
    
  }

  dismiss() {
    this.activeModal.dismiss();
  }

  dateFormat(date: string | any) {
    const [year, month, day] = date.split("/");

    return `${day}/${month}/${year}`;
  }

  calcAge(date: string | any) {
    const [month, day, year] = date.split("/");
    const todayDate = this.calendar.getToday();
    let age = todayDate.year - parseInt(year);

    const monthDiff = todayDate.month - parseInt(month);
    if (monthDiff < 0 || (monthDiff === 0 && todayDate.day < parseInt(day))) {
      age--;
    }

    return `${age}`;
  }

  reportLoaded(pdf: PDFDocumentProxy) {
    this.isPrinting = false;
    this.isDocumentLoaded = true;
  }

  zoomReport(zoom: number) {
    this.reportZoom += zoom;
    
    if(this.reportZoom < 0) {
      this.reportZoom = 0;
    }
  }

  sanitizeHtml(rawHtml: string): SafeHtml {
    return this.sanitize.bypassSecurityTrustHtml(rawHtml);
  }

}
