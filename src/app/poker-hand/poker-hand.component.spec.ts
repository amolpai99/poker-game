import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokerHandComponent } from './poker-hand.component';

describe('PokerHandComponent', () => {
  let component: PokerHandComponent;
  let fixture: ComponentFixture<PokerHandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PokerHandComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokerHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
