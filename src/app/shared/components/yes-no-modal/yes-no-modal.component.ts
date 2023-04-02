import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'mds-yes-no-modal',
  templateUrl: './yes-no-modal.component.html',
  styleUrls: ['./yes-no-modal.component.scss']
})
export class YesNoModalComponent {
  @Input() title = "Do you agree?"
  @Input() modalBody = ""
  @Input() yesLabel = "Yes"
  @Input() noLabel = "Cancel"

  dismiss() {
    this.activeModal.dismiss();
  }

  close(result: boolean) {
    this.activeModal.close(result);
  }

  constructor(public activeModal: NgbActiveModal) { }
}
