import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationMailComponent } from './verification-mail.component';

describe('VerificationMailComponent', () => {
  let component: VerificationMailComponent;
  let fixture: ComponentFixture<VerificationMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerificationMailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificationMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
