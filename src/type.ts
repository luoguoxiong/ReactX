// 定义模型的类型
export type State = Record<string, any>;

export type Update<S extends State> = (state: S, ...payload: any) => S;

export type Effect<S, UpdateKeys extends string> =(useUpdate: Record<UpdateKeys, UseUpdate>, state: S, ...payload: any) => Promise<void>

export type StoreType<S extends State, UpdateKeys extends string = string, EffectKeys extends string=string > = {
  state: S;
  updates: {
    [key in UpdateKeys]: Update<S>;
  };
  effects: {
    [key in EffectKeys]: Effect<S, UpdateKeys>
  };
};

export type UseUpdate = (...payload: any) => void

export type UseEffect= (...payload: any) => void
