import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, filter, map, Observable, of, take, tap } from 'rxjs';
import { FormwizardEffectService } from 'src/app/services/effects/formwizard.effect.service';
import { StaffModel } from 'src/app/shared/interfaces/template';

@Component({
  selector: 'mds-staff-modal',
  templateUrl: './staff-modal.component.html',
  styleUrls: ['./staff-modal.component.scss']
})
export class StaffModalComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private effect: FormwizardEffectService) { }

  searchQuery: string = "";
  newStaff: StaffModel = {
    name: "",
    licNo: ""
  }

  staffList$: BehaviorSubject<StaffModel[]> = new BehaviorSubject([] as StaffModel[]);

  ngOnInit(): void {
    this.effect.getStaffList().subscribe((staff: StaffModel[]) => {
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
    this.effect.saveStaff(this.newStaff).subscribe((addedStaff: StaffModel) => {
      this.staffList$.next([...this.staffList$.getValue(), addedStaff]);
      this.resetForm();
    });
  }

  
  selectStaff(staff: StaffModel) {
    this.activeModal.close(staff);
  }

  deleteStaff(staff: StaffModel) {
    this.effect.deleteStaff(staff).subscribe((deletedStaff) => {
      this.staffList$.next(this.staffList$.getValue().filter(staffItem => staffItem.id !== deletedStaff.id))
    });
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
