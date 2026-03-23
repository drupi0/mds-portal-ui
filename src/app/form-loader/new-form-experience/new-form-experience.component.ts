import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

type TemplateOption = {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  staff: { role: string; name: string; }[];
};

type WorkflowColumn = {
  id: string;
  name: string;
  hint: string;
  items: TemplateOption[];
};

@Component({
  selector: 'mds-new-form-experience',
  standalone: false,
  templateUrl: './new-form-experience.component.html',
  styleUrls: ['./new-form-experience.component.scss']
})
export class NewFormExperienceComponent {
  @ViewChild('signOffModal') signOffModal?: TemplateRef<unknown>;

  constructor(private modalService: NgbModal) { }

  readonly mockMrNo = `M${String(Date.now()).slice(-7).padStart(7, '0')}`;

  currentStep = 1;
  templateSearch = '';
  private signOffModalShown = false;

  readonly stepLabels = [
    { id: 1, label: 'Basic Information' },
    { id: 2, label: 'Templates to Use' },
    { id: 3, label: 'Workflow' }
  ];

  readonly templateOptions: TemplateOption[] = [
    {
      id: 'histopathology',
      name: 'Histopathology',
      description: 'Standard tissue processing and pathologist review.',
      selected: true,
      staff: [
        { role: 'Performed by', name: 'Med Tech A. Santos' },
        { role: 'Verified by', name: 'Senior Med Tech P. Reyes' },
        { role: 'Pathologist', name: 'Dr. M. Navarro' }
      ]
    },
    {
      id: 'ihc',
      name: 'Immunohistochemistry',
      description: 'Marker panel and stain interpretation block.',
      selected: true,
      staff: [
        { role: 'Performed by', name: 'Med Tech C. Lim' },
        { role: 'Verified by', name: 'Chief Med Tech L. Torres' },
        { role: 'Pathologist', name: 'Dr. S. Fernandez' }
      ]
    },
    {
      id: 'cytology',
      name: 'Cytology',
      description: 'Cell-based specimen findings and adequacy notes.',
      selected: false,
      staff: [
        { role: 'Performed by', name: 'Cytotechnologist K. Mateo' },
        { role: 'Verified by', name: 'Senior Cytotech B. Cruz' },
        { role: 'Pathologist', name: 'Dr. A. Villanueva' }
      ]
    },
    {
      id: 'frozen-section',
      name: 'Frozen Section',
      description: 'Rapid intraoperative consultation template.',
      selected: false,
      staff: [
        { role: 'Performed by', name: 'Lab Scientist D. Ramos' },
        { role: 'Verified by', name: 'Section Lead E. Tan' },
        { role: 'Pathologist', name: 'Dr. J. Santos' }
      ]
    },
    {
      id: 'special-stains',
      name: 'Special Stains',
      description: 'Ancillary stain checklist and findings.',
      selected: true,
      staff: [
        { role: 'Performed by', name: 'Stainer P. Lopez' },
        { role: 'Verified by', name: 'Senior Med Tech V. Ong' },
        { role: 'Pathologist', name: 'Dr. C. Dizon' }
      ]
    }
  ];

  workflowColumns: WorkflowColumn[] = [
    {
      id: 'specimen-received',
      name: 'Specimen Received',
      hint: 'Accessioning and intake',
      items: []
    },
    {
      id: 'processing',
      name: 'Laboratory Processing',
      hint: 'Technical workup',
      items: []
    },
    {
      id: 'pathologist-review',
      name: 'Pathologist Review',
      hint: 'Interpretation and approval',
      items: []
    },
    {
      id: 'sign-off',
      name: 'Sign Off',
      hint: 'Ready for final staff confirmation',
      items: []
    }
  ];

  get filteredTemplates() {
    const query = this.templateSearch.trim().toLowerCase();

    if (!query.length) {
      return this.templateOptions;
    }

    return this.templateOptions.filter(template =>
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query)
    );
  }

  get selectedTemplates() {
    return this.templateOptions.filter(template => template.selected);
  }

  get canProceedFromTemplates() {
    return this.selectedTemplates.length > 0;
  }

  toggleTemplate(template: TemplateOption) {
    template.selected = !template.selected;
  }

  previousStep() {
    if (this.currentStep === 1) {
      return;
    }

    this.currentStep -= 1;
  }

  nextStep() {
    if (this.currentStep === 2 && !this.canProceedFromTemplates) {
      return;
    }

    if (this.currentStep === 2) {
      this.initializeWorkflow();
    }

    if (this.currentStep < this.stepLabels.length) {
      this.currentStep += 1;
    }
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  drop(event: CdkDragDrop<TemplateOption[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.signOffModalShown = false;
    this.checkWorkflowForSignOff();
  }

  private initializeWorkflow() {
    const selectedTemplateIds = new Set(this.selectedTemplates.map(template => template.id));
    this.workflowColumns.forEach((column, index) => {
      if (index === 0) {
        column.items = this.selectedTemplates.map(template => ({ ...template }));
        return;
      }

      column.items = column.items.filter(template => selectedTemplateIds.has(template.id));
    });

    this.signOffModalShown = false;
  }

  private checkWorkflowForSignOff() {
    const signOffColumn = this.workflowColumns.find(column => column.id === 'sign-off');

    if (!signOffColumn) {
      return;
    }

    const allTemplatesInSignOff = this.selectedTemplates.length > 0
      && signOffColumn.items.length === this.selectedTemplates.length;

    if (!allTemplatesInSignOff || this.signOffModalShown || !this.signOffModal) {
      return;
    }

    this.signOffModalShown = true;
    this.modalService.open(this.signOffModal, {
      centered: true,
      size: 'lg',
      modalDialogClass: 'new-form-signoff-modal'
    });
  }
}
