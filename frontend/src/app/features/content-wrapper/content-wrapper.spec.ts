import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentWrapper } from './content-wrapper';

describe('ContentWrapper', () => {
  let component: ContentWrapper;
  let fixture: ComponentFixture<ContentWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentWrapper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentWrapper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
