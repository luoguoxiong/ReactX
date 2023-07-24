# store
一个轻量、简单的React 状态管理库

## Example
```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Store } from '@rctool/store';

interface CounterIn{
  counter: number;
}

type StoreMutationKeys = 'increment' | 'decrement'

type StoreActionKeys = 'asyncIncrement' | 'asyncDecrement'

const delay = (time) => new Promise((res) => {
  setTimeout(() => {
    res(true);
  }, time);
});

const { StoreProvide, useStore } = new Store<CounterIn, StoreMutationKeys, StoreActionKeys>({
  state: {
    counter: 0,
  },
  mutations: {
    increment: ( state, num) => {
      state.counter += 1;
    },
    decrement: ( state, num) => {
      state.counter -= 1;
    },
  },
  actions: {
    async asyncIncrement(commit, num) {
      await delay(1000);
      commit.increment(num);
    },
    async asyncDecrement(commit, num) {
      await delay(1000);
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
        dispatch.asyncDecrement(1);
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


ReactDOM.render(
  <React.StrictMode>
    <StoreProvide>
      <Counter />
    </StoreProvide>
  </React.StrictMode>
  ,
  document.getElementById('root'),
);
```