import { ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
const NOT_SET = Symbol('NOT_SET');

export function toObservable(target, key) {
  let currentValue = NOT_SET;
  const subject = new ReplaySubject(1);
  if (target[key] !== undefined) { subject.next(target[key]); }
  const observable = subject.asObservable().pipe(distinctUntilChanged());
  // tslint:disable-next-line:variable-name
  const _init: () => void = target.ngOnInit;
  // tslint:disable-next-line:only-arrow-functions space-before-function-paren
  target.ngOnInit = function (...args) {
    if (_init) { _init.call(this, ...args); }
    if (currentValue === NOT_SET) {
      console.warn('hg-resolvers (toObservable): WARNING! Provided undefined value for @Input. Did you forget to bind your property?');
    }
  };

  Object.defineProperty(target, key, {
    set: (value) => { Promise.resolve().then(() => subject.next(value)); currentValue = value; },
    get: () => observable
  });
}
