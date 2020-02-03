export enum ResolverState {
  PENDING, // initial state (the resolver is created but nothing is happening)
  RESOLVING, // the resolver is waiting for the data
  SETTLED, // the resolver has successfully received the data
  ERRORED, // the resolver has errored
  COMPLETED // the resolver has completed its job and its about the get destroyed
}

export enum ResolveState {
  PENDING, // initial state (the resolve container is created but nothing is happening)
  RESOLVING, // one of the resolvers is resolving
  SETTLED, // all the resolvers have successfully received the data
  ERRORED, // one of the resolver has errored
  COMPLETED // the resolve has completed and it's about to get destroyed
}
