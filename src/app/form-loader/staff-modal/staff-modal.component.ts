import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxNotificationService } from 'ngx-notification';
import { BehaviorSubject, filter, map, Observable, of, take, tap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FormwizardEffectService } from 'src/app/services/effects/formwizard.effect.service';
import { YesNoModalComponent } from 'src/app/shared/components/yes-no-modal/yes-no-modal.component';
import { StaffModel } from 'src/app/shared/interfaces/template';

@Component({
  selector: 'mds-staff-modal',
  templateUrl: './staff-modal.component.html',
  styleUrls: ['./staff-modal.component.scss']
})
export class StaffModalComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private api: ApiService, private modalService: NgbModal,
              private notifSvc: NgxNotificationService) { }

  searchQuery: string = "";
  newStaff: StaffModel = {
    name: "",
    licNo: ""
  }

  staffList$: BehaviorSubject<StaffModel[]> = new BehaviorSubject([] as StaffModel[]);

  ngOnInit(): void {
    this.api.getStaff().subscribe((staff: StaffModel[]) => {
      this.staffList$.next(staff);
    });
  }

  get staffList(): Observable<StaffModel[]> {
    return this.staffList$.pipe(map((staffArray: StaffModel[]) => {
      return this.searchQuery.trim().length ? staffArray.filter(item => 
        item.name.toLocaleLowerCase().includes(this.searchQuery.trim().toLowerCase()) 
        || item.licNo === this.searchQuery.trim().toLowerCase()) : staffArray;
    }));
  }

  saveStaff() {
    this.api.saveStaff(this.newStaff).subscribe((addedStaff: StaffModel) => {
      this.staffList$.next([...this.staffList$.getValue(), addedStaff]);
      this.resetForm();
      this.notifSvc.sendMessage(`Successfully added ${addedStaff.name} with license no. ${addedStaff.licNo} to the staff list`, 'success', 'top-right');
    });
  }

  
  selectStaff(staff: StaffModel) {
    this.activeModal.close(staff);
  }

  deleteStaff(staff: StaffModel) {
    const modalRef = this.modalService.open(YesNoModalComponent, {
      size: 'md',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = `Delete "${ staff.name }"?`
    modalRef.componentInstance.modalBody = `Delete ${staff.name} with license no. ${staff.licNo} from the list of staff?`

    modalRef.closed.subscribe((response) => {
      console.log(response);
        if(response) {
          this.api.deleteStaff(staff).subscribe(() => {
            this.staffList$.next(this.staffList$.getValue().filter(staffItem => staffItem.id !== staff.id));
            this.notifSvc.sendMessage(`Successfully deleted ${staff.name} from the staff list`, 'success', 'top-right');
          });
      }
    })
  }

  resetForm() {
    this.newStaff = {
      name: "",
      licNo: ""
    }
  }

  dismiss() {
    this.activeModal.dismiss();
  }
}
