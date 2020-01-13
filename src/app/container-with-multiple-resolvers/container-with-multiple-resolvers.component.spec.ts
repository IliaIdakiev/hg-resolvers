import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerWithMultipleResolversComponent } from './container-with-multiple-resolvers.component';

describe('SingleResolverWithContainerComponent', () => {
  let component: ContainerWithMultipleResolversComponent;
  let fixture: ComponentFixture<ContainerWithMultipleResolversComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContainerWithMultipleResolversComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerWithMultipleResolversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
