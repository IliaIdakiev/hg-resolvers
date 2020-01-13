import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerWithMultipleResolversWithDependenciesComponent } from './container-with-multiple-resolvers-with-dependencies.component';

describe('SingleResolverWithContainerComponent', () => {
  let component: ContainerWithMultipleResolversWithDependenciesComponent;
  let fixture: ComponentFixture<ContainerWithMultipleResolversWithDependenciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContainerWithMultipleResolversWithDependenciesComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerWithMultipleResolversWithDependenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
