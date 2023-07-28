import React, { useContext, createContext, useMemo } from 'react';
import { ModelOptionsRe } from './type';
import { cloneObj, isFunction, isObject, isAsyncFunction } from './utils';

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
    this.currenState = cloneObj(modal.state);
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
        console.error('update:error', err);
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
    this.commit = commit;
    this.dispatch = dispatch;
    const Context = createContext(context);
    this.StoreProvide = this.createProvider(Context, context);
    const useStore = () => useContext(Context);
    this.useStore = useStore;
    this.getState = this.getState.bind(this);
    this.withReactX = this.withReactX.bind(this);
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
    return commits;
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

  public commit: T['commit'];

  public dispatch: T['dispatch'];

  public useStore: () => {
    state: T['state'];
    commit: T['commit'];
    dispatch: T['dispatch'];
  };

  public StoreProvide: React.FC<{children: React.ReactNode}>;

  public withReactX<OwnProps>(SubComponent: React.ComponentType<OwnProps & {
    state: T['state'];
    commit: T['commit'];
    dispatch: T['dispatch'];
  }
  >,) {
    function withGlobalModelContainer(props: OwnProps) {
      const model = this.useStore();
      return (
        <SubComponent
          {...props}
          {...model}/>
      );
    }
    return withGlobalModelContainer.bind(this);
  }
}
