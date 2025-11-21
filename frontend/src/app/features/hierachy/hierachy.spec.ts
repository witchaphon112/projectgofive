import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hierachy } from './hierachy';

describe('Hierachy', () => {
  let component: Hierachy;
  let fixture: ComponentFixture<Hierachy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hierachy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hierachy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
