import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicallyAttachingDuplicateResolversComponent } from './dynamically-attaching-duplicate-resolvers.component';

describe('SingleResolverWithContainerComponent', () => {
  let component: DynamicallyAttachingResolversComponent;
  let fixture: ComponentFixture<DynamicallyAttachingResolversComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicallyAttachingDuplicateResolversComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicallyAttachingDuplicateResolversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
