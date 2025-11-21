import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddObjectiveDialog } from './add-objective-dialog';

describe('AddObjectiveDialog', () => {
  let component: AddObjectiveDialog;
  let fixture: ComponentFixture<AddObjectiveDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddObjectiveDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddObjectiveDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
