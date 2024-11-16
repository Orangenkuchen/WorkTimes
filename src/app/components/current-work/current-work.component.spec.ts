import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentWorkComponent } from './current-work.component';

describe('CurrentWorkComponent', () => {
  let component: CurrentWorkComponent;
  let fixture: ComponentFixture<CurrentWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentWorkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CurrentWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
