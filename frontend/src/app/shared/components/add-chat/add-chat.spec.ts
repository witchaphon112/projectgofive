import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChatDialogComponent } from './add-chat';

describe('AddChat', () => {
  let component: NewChatDialogComponent;
  let fixture: ComponentFixture<NewChatDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewChatDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewChatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
