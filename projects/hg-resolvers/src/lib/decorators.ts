import { ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

const state = new WeakMap();

export function toObservable(target: any, key: any): any {
  const NOT_SET = Symbol('NOT_SET');
  const SUBJ = Symbol('SUBJ');
  const OBS = Symbol('OBS');
  const CURRENT_VALUE = Symbol('CURRENT_VALUE');

  // tslint:disable-next-line:typedef
  function _do(this: any, value?: any) {
    const currentState = state.get(this) || {};
    if (!currentState.hasOwnProperty(key)) { currentState[key] = {}; }

    if (typeof currentState[key][CURRENT_VALUE] === 'undefined') {
      currentState[key][CURRENT_VALUE] = arguments.length === 0 ? NOT_SET : value;
      currentState[key][SUBJ] = new ReplaySubject(1);
      currentState[key][OBS] = currentState[key][SUBJ].asObservable().pipe(distinctUntilChanged());
      state.set(this, currentState);
    }

    if (arguments.length !== 0) { currentState[key][CURRENT_VALUE] = value; }
    if (currentState[key][CURRENT_VALUE] !== NOT_SET) {
      currentState[key][SUBJ].next(currentState[key][CURRENT_VALUE]);
    }

    return currentState;
  }
  // tslint:disable-next-line:variable-name
  const _onInit: () => void = target.ngOnInit;

  // tslint:disable-next-line:space-before-function-paren
  target.ngOnInit = function (...args: any[]): any {

    const currentState = _do.call(this);

    if (_onInit) { (_onInit as any).call(this, ...args); }

    if (currentState[CURRENT_VALUE] === NOT_SET) {
      console.warn('hg-resolvers (toObservable): WARNING! Provided undefined value for @Input. Did you forget to bind your property?');
    }
  };

  Object.defineProperty(target, key, {
    // tslint:disable-next-line:typedef
    set(value) {
      _do.call(this, value);
    },
    // tslint:disable-next-line:typedef
    get() {
      const currentState = state.get(this) || {};
      return currentState[key][OBS];
    }
  });
}
