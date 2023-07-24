export type State = Record<string, any>;

export type Update<S extends State> = (state: S, ...payload: any) => void;

export type Effect< UpdateKeys extends string> =(useUpdate: Record<UpdateKeys, TaskFn>, ...payload: any) => Promise<void>

export type StoreType<S extends State, UpdateKeys extends string = string, EffectKeys extends string=string > = {
  state: S;
  mutations: {
    [key in UpdateKeys]: Update<S>;
  };
  actions: {
    [key in EffectKeys]: Effect<UpdateKeys>
  };
};

export type TaskFn = (...payload: any) => void
