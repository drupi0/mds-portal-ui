import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintformComponent } from './printform.component';

describe('PrintformComponent', () => {
  let component: PrintformComponent;
  let fixture: ComponentFixture<PrintformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintformComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
