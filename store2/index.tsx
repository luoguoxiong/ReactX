import React, { useContext, createContext, useMemo } from 'react';
import { ModelOptions, ModelOptionsRe } from './type';
import { cloneObj, isFunction, isObject, isAsyncFunction } from './utils';
export function createModel<
  State extends object,
  Mutations extends object,
  Actions extends object,
>(
  modelConfig: ModelOptions<State, Mutations, Actions>): ModelOptionsRe<State, Mutations, Actions>
{
  return modelConfig as any;
}

export class ReactX<T extends ModelOptionsRe<object, object, object>>{

  /** Store 状态 */
  protected state: T['state'];

  /** Store 计算中的状态 */
  protected currenState: T['state'];

  /** 是否有正在计算中更新任务 */
  protected isUpdateQuene: boolean = false;

  /** React 触发更新状态 */
  protected setState: React.Dispatch<React.SetStateAction< T['state']>>;
  public store: T;
  constructor(modal: T){
    this.store = modal;
    this.state = modal.state;
    if(!isObject(modal.state)){
      throw Error('Store state is not object');
    }
    const { mutations, actions } = modal;
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
    this.currenState = cloneObj(modal.state);
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
    const commits = {} as any;
    for(const key in mutations){
      commits[key] = (...payload: any) => {
        const update = mutations[key] as any;
        update(this.currenState, ...payload);
        this.update();
      };
    }
    return commits as T['commit'];
  }

  protected compileAction(commit: T['commit']) {
    const { actions } = this.store;
    const dispatchs = {} as T['commit'];
    for(const key in actions){
      dispatchs[key] = (...payload) => {
        const effect = actions[key];
        effect(commit, this.currenState, ...payload);
      };
    }
    return dispatchs;
  }
  protected createProvider(Context, context){
    function Provide({ children }: {children: React.ReactNode}) {

      const [state, setState] = React.useState<T['state']>(() => this.state);

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
    state: T['state'];
    commit: T['commit'];
    dispatch: T['dispatch'];
  };

  public StoreProvide: React.FC<{children: React.ReactNode}>;
}
