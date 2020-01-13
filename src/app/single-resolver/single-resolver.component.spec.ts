import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleResolverComponent } from './single-resolver.component';

describe('SingleResolverComponent', () => {
  let component: SingleResolverComponent;
  let fixture: ComponentFixture<SingleResolverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleResolverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleResolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
