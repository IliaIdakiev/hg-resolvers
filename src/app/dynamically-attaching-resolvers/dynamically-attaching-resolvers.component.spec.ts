import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicallyAttachingResolversComponent } from './dynamically-attaching-resolvers.component';

describe('SingleResolverWithContainerComponent', () => {
  let component: DynamicallyAttachingResolversComponent;
  let fixture: ComponentFixture<DynamicallyAttachingResolversComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicallyAttachingResolversComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicallyAttachingResolversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
