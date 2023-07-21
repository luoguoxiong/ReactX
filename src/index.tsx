import React, { useContext, createContext, useMemo, useEffect } from 'react';
import { StoreType, State, UseUpdate, UseEffect } from './type';

export class Store<S extends State, SUK extends string, SEK extends string>{
  protected store: StoreType<S, SUK, SEK>;

  protected state: S;

  protected isUpdateQuene: boolean = false;

  protected setState: React.Dispatch<React.SetStateAction<S>>;

  protected updates: {
    [key in SUK]: UseUpdate;
  };

  protected effects: {
    [key in SEK]: UseEffect
  };

  constructor(store: StoreType<S, SUK, SEK>){
    this.store = store;
    this.state = store.state;
    this.init();
  }

  protected update(newState: S) {
    this.state = newState;
    // 避免重复更新
    if(!this.isUpdateQuene){
      this.isUpdateQuene = true;
      if(!this.setState){
        throw Error('please use StoreProvide Api first！');
      }
      Promise.resolve().then(() => {
        this.setState(this.state);
        this.store.state = this.state;
        this.isUpdateQuene = false;
      });
    }
  }

  protected init(){
    const context = {
      state: this.state,
      updates: this.compileUpdates(),
      effects: this.compileEffects(),
    };
    const Context = createContext(context);
    const useStore = () => useContext(Context);
    this.StoreProvide = this.createProvider(Context, context);
    this.useStore = useStore;
  }

  protected compileUpdates() {
    const { updates } = this.store;
    const updatesDo = {} as {
      [key in SUK]: UseUpdate;
    };
    for(const key in updates){
      updatesDo[key] = (...payload) => {
        const update = updates[key];
        const newState = update(this.state, ...payload);
        this.update(newState);
      };
    }
    this.updates = updatesDo;
    return updatesDo;
  }

  protected compileEffects() {
    const { effects } = this.store;
    const effectsDo = {} as {
      [key in SEK]: UseEffect
    };
    for(const key in effects){
      effectsDo[key] = (...payload) => {
        const effect = effects[key];
        effect(this.updates, this.state, ...payload);
      };
    }
    this.effects = effectsDo;
    return effectsDo;
  }

  protected createProvider(Context, context){
    function Provide({ children }: {children: React.ReactNode}) {

      const [state, setState] = React.useState<S>(() => this.state);

      useEffect(() => {
        this.setState = setState;
      }, [setState]);

      const ctx = useMemo(() => ({
        ...context,
        state,
      }), [state]);

      return (
        <Context.Provider
          value={ctx}
        >
          {children}
        </Context.Provider>
      );
    }
    return Provide.bind(this);
  }

  public getState(){
    return this.state;
  }

  public useStore: () => {
    state: S;
    updates: {
      [key in SUK]?: UseUpdate;
    } ;
    effects: {
      [key in SEK]?: UseEffect
    };
  };

  public StoreProvide: React.FC<{children: React.ReactNode}>;
}

export type { StoreType };
