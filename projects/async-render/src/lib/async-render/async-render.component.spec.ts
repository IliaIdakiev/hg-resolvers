import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsyncRenderComponent } from './async-render.component';

describe('AsyncRenderComponent', () => {
  let component: AsyncRenderComponent;
  let fixture: ComponentFixture<AsyncRenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsyncRenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsyncRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
