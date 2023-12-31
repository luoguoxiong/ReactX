# ReactX
一个轻量、简单的React 状态管理库

## Example
```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createReactX } from '@rctool/reactx';

const { useStore, StoreProvide, withReactX } = createReactX({
  state: {
    counter: 0,
  },
  mutations: {
    increment: (rootState, num: number) => {
      rootState.counter += num;
    },
    decrement: ( rootState, num: number) => {
      rootState.counter += num;
    },
  },
  actions: {
    async asyncIncrement(commit, rootState, num: number) {
      commit.increment(num);
    },
    async asyncDecrement(commit, rootState, num: number, clas: number) {
      commit.decrement(num);
    },
  },
});


const Counter = () => {
  const { state, commit, dispatch } = useStore();
  return (
    <>
      <button onClick={() => {
        commit.increment(1);
      }}>
       increment
      </button>
      <button onClick={() => {
        commit.decrement(1);
      }}>
        decrement
      </button>
      <button onClick={() => {
        dispatch.asyncDecrement(1, 22);
      }}>
      asyncDecrement
      </button>
      <button onClick={() => {
        dispatch.asyncIncrement(1);
      }}>
       asyncIncrement
      </button>
      <div>{state.counter}</div>
    </>
  );
};

const Counter2 = withReactX(({ commit, state, dispatch }) => (
  <>
    <button onClick={() => {
      commit.increment(11);
    }}>
       increment
    </button>
    <button onClick={() => {
      commit.decrement(1);
    }}>
        decrement
    </button>
    <button onClick={() => {
      dispatch.asyncDecrement(1, 1);
    }}>
      asyncDecrement
    </button>
    <button onClick={() => {
      dispatch.asyncIncrement(1);
    }}>
       asyncIncrement
    </button>
    <div>{state.counter}</div>
  </>
));


ReactDOM.render(
  <React.StrictMode>
    <StoreProvide>
      <Counter />
      <Counter2/>
    </StoreProvide>
  </React.StrictMode>
  ,
  document.getElementById('root'),
);

```