import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export function toObservable(target, key) {
  const subject = new BehaviorSubject(target[key]);
  const observable = subject.asObservable().pipe(distinctUntilChanged());
  Object.defineProperty(target, key, {
      set: (value) => { subject.next(value); },
      get: () => observable
  });
}
