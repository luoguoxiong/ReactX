export type ModelOptions<State, Mutations, Actions> = {
  state: State;
  mutations: Mutations & {
    [key in keyof Mutations]: (state: State, ...payload: any) => void;
  };
  actions: Actions & {
    [key in keyof Actions]: (commit:
    {
      [K in keyof Mutations]: CommitFunction<Mutations[K], State>
    },
      state: State, ...payload: any) => Promise<void>;
  };
}

export type ModelOptionsRe<State, Mutations, Actions> = {
  state: State;
  mutations?: {
    [key in keyof Mutations]: (state: State, ...payload: any) => void;
  };
  actions?: {
    [key in keyof Actions]: (commit:
    {
      [K in keyof Mutations]: CommitFunction<Mutations[K], State>
    },
      state: State, payload: any) => Promise<void>;
  };
  commit?: {
    [K in keyof Mutations]: CommitFunction<Mutations[K], State>
  };
  dispatch?: {
    [K in keyof Actions]: DispatchFunction<Actions[K], State>
  };
}

export type ModelOptionsRes<State, Mutations, Actions> = {
  state: State;
  mutations: Mutations & {
    [key in keyof Mutations]: (state: State, ...payload: any) => void;
  };
  actions?: {
    [key in keyof Actions]: (commit:
    {
      [K in keyof Mutations]: CommitFunction<Mutations[K], State>
    },
      state: State, payload: any) => Promise<void>;
  };
  extra: {
    [K in keyof Mutations]: CommitFunction<Mutations[K], State>
  };
}


export type CommitFunction<T, S> = T extends (rootState: S, ...args: infer P) => any ? (...args: P) => void : never;

export type CommitFunction2<T> = T extends (rootState: any, ...args: infer P) => any ? (...args: P) => void : never;

export type DispatchFunction<T, S> = T extends (commit: any, rootState: S, ...args: infer P) => Promise<any> ? (...args: P) => void : never;
