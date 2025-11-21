import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDocumentsDialog } from './add-documents-dialog';

describe('AddDocumentsDialog', () => {
  let component: AddDocumentsDialog;
  let fixture: ComponentFixture<AddDocumentsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDocumentsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDocumentsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
