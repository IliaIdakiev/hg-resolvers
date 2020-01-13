import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexLoadersComponent } from './complex-loaders.component';

describe('SingleResolverWithContainerComponent', () => {
  let component: ComplexLoadersComponent;
  let fixture: ComponentFixture<ComplexLoadersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComplexLoadersComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplexLoadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
