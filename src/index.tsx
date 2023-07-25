import React, { useContext, createContext, useMemo } from 'react';
import { cloneObj, isFunction, isObject, isAsyncFunction } from './utils';
import { StoreType, State, TaskRecord } from './type';

export class Store<S extends State, StoreMutationKeys extends string, StoreActionKeys extends string>{
  protected store: StoreType<S, StoreMutationKeys, StoreActionKeys>;

  /** Store 状态 */
  protected state: S;

  /** Store 计算中的状态 */
  protected currenState: S;

  /** 是否有正在计算中更新任务 */
  protected isUpdateQuene: boolean = false;

  /** React 触发更新状态 */
  protected setState: React.Dispatch<React.SetStateAction<S>>;
  /**
   * Create a Store.
   * @param {StoreType} store - The store init.
   */
  constructor(store: StoreType<S, StoreMutationKeys, StoreActionKeys>){
    if(!isObject(store.state)){
      throw Error('Store state is not object');
    }
    const { mutations, actions } = store;
    for (const key in mutations) {
      if(!isFunction(mutations[key])){
        throw Error(`Store mutations.${key} is not function`);
      }
    }
    for (const key in actions) {
      if(!(isFunction(actions[key]) || isAsyncFunction(actions[key]))){
        throw Error(`Store actions.${key} is not function`);
      }
    }
    this.store = store;
    this.state = store.state;
    this.currenState = cloneObj(store.state);
    this.init();
  }

  protected update() {
    // 避免重复更新
    if(!this.isUpdateQuene){
      this.isUpdateQuene = true;
      if(!this.setState){
        throw Error('please use StoreProvide Api first！');
      }
      Promise.resolve().then(() => {
        const newState = cloneObj(this.currenState);
        this.state = newState;
        this.setState(newState);
        this.isUpdateQuene = false;
      }).catch((err) => {
        console.log(err);
        this.currenState = cloneObj(this.state);
      });
    }
  }

  protected init(){
    const commit = this.compileMutation();
    const dispatch = this.compileAction(commit);
    const context = {
      state: this.state,
      commit,
      dispatch,
    };
    const Context = createContext(context);
    this.StoreProvide = this.createProvider(Context, context);
    const useStore = () => useContext(Context);
    this.useStore = useStore;
    this.getState = this.getState.bind(this);
  }

  protected compileMutation() {
    const { mutations } = this.store;
    const commits = {} as TaskRecord<StoreMutationKeys>;
    for(const key in mutations){
      commits[key] = (...payload) => {
        const update = mutations[key];
        update(this.currenState, ...payload);
        this.update();
      };
    }
    return commits;
  }

  protected compileAction(commit: TaskRecord<StoreMutationKeys>) {
    const { actions } = this.store;
    const dispatchs = {} as TaskRecord<StoreActionKeys>;
    for(const key in actions){
      dispatchs[key] = (...payload) => {
        const effect = actions[key];
        effect(commit, ...payload);
      };
    }
    return dispatchs;
  }

  protected createProvider(Context, context){
    function Provide({ children }: {children: React.ReactNode}) {

      const [state, setState] = React.useState<S>(() => this.state);

      this.setState = setState;

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
    commit: TaskRecord<StoreMutationKeys> ;
    dispatch: TaskRecord<StoreActionKeys>;
  };

  public StoreProvide: React.FC<{children: React.ReactNode}>;
}

export type { StoreType };
