import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateModalComponent } from './template-modal.component';

describe('TemplateModalComponent', () => {
  let component: TemplateModalComponent;
  let fixture: ComponentFixture<TemplateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
