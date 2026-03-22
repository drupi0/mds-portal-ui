import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'mds-form-actions-modal',
  standalone: false,
  templateUrl: './form-actions-modal.component.html',
  styleUrls: ['./form-actions-modal.component.scss']
})
export class FormActionsModalComponent {
  @Input() canDelete = false;

  constructor(public activeModal: NgbActiveModal) { }

  close(action: 'open' | 'duplicate' | 'delete' | 'cancel') {
    this.activeModal.close(action);
  }
}
