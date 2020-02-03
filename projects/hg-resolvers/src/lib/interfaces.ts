import { ReplaySubject, Subject } from 'rxjs';
import { Resolver } from './resolver';
import { ResolveBase } from './resolve-base';

export interface IResolverRecord {
  resolveContainer: ResolveBase;
  ctor: any;
  requested: boolean;
  resolved: boolean;
  delegateInstance: Resolver<any>;
  delegateChannel: ReplaySubject<{
    type: 'deps' | 'success' | 'failure' | 'loading' | 'completed', data: any | Error
  }>;
  subscriberInstances: Resolver<any>[];
  __subscriberInstances: Resolver<any>[];
  noSubscriptions$: Subject<void>;
}
