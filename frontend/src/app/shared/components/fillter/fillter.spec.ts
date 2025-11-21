import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fillter } from './fillter';

describe('Fillter', () => {
  let component: Fillter;
  let fixture: ComponentFixture<Fillter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fillter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fillter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
