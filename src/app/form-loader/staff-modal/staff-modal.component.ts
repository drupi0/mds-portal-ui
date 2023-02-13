import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { filter, map, of } from 'rxjs';
import { FormwizardEffectService } from 'src/app/services/effects/formwizard.effect.service';
import { StaffModel } from 'src/app/shared/interfaces/template';

@Component({
  selector: 'mds-staff-modal',
  templateUrl: './staff-modal.component.html',
  styleUrls: ['./staff-modal.component.scss']
})
export class StaffModalComponent {

  constructor(public activeModal: NgbActiveModal, private effect: FormwizardEffectService) { }

  searchQuery: string = "";
  newStaff: StaffModel = {
    name: "",
    licNo: ""
  }

  staff: StaffModel[] = [];
  
  getStaffList() {
    return this.effect.getStaffList().pipe(map(staffObj => this.searchQuery.trim().length ? 
            staffObj.filter(staffElement => staffElement.name.toLowerCase().includes(this.searchQuery) || staffElement.licNo.includes(this.searchQuery)) : staffObj));
  }
  
  selectStaff(staff: StaffModel) {
    this.activeModal.close(staff);
  }

  deleteStaff(staff: StaffModel) {
    this.staff = this.staff.filter(staffItem => staffItem.licNo !== staff.licNo);
  }

  saveStaff() {
    this.staff.push(this.newStaff);
    this.resetForm();
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
