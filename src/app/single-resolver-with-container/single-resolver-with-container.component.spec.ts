import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleResolverWithContainerComponent } from './single-resolver-with-container.component';

describe('SingleResolverWithContainerComponent', () => {
  let component: SingleResolverWithContainerComponent;
  let fixture: ComponentFixture<SingleResolverWithContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SingleResolverWithContainerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleResolverWithContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
