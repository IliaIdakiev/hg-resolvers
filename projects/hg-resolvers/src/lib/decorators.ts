import { ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

const NOT_SET = Symbol('NOT_SET');
const SUBJ = Symbol('SUBJ');
const OBS = Symbol('OBS');
const CURRENT_VALUE = Symbol('CURRENT_VALUE');

function _init() {
  if (typeof this[CURRENT_VALUE] === 'undefined') { this[CURRENT_VALUE] = NOT_SET; }
  this[SUBJ] = new ReplaySubject(1);
  if (this[CURRENT_VALUE] !== NOT_SET) { this[SUBJ].next(this[CURRENT_VALUE]); }
  this[OBS] = this[SUBJ].asObservable().pipe(distinctUntilChanged());
}

export function toObservable(target, key) {
  // tslint:disable-next-line:variable-name
  const _onInit: () => void = target.ngOnInit;

  target.ngOnInit = function (...args) {
    if (!this[SUBJ]) { _init.call(this); }

    if (_onInit) { _onInit.call(this, ...args); }

    if (this[CURRENT_VALUE] === NOT_SET) {
      console.warn('hg-resolvers (toObservable): WARNING! Provided undefined value for @Input. Did you forget to bind your property?');
    }
  };

  Object.defineProperty(target, key, {
    set(value) {
      if (!this[SUBJ]) { _init.call(this); }
      this[SUBJ].next(value);
      this[CURRENT_VALUE] = value;
    },
    get() { return this[OBS]; }
  });
}
