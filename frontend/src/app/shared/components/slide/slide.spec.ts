import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Slide } from './slide';

describe('Slide', () => {
  let component: Slide;
  let fixture: ComponentFixture<Slide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Slide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Slide);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
