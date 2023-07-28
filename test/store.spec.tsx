import React from 'react';
import * as rtl from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createReactX } from '../src/index';


const delay = (time) => new Promise((res) => {
  setTimeout(() => {
    res(true);
  }, time);
});

const { StoreProvide, useStore, getState } = createReactX({
  state: {
    counter: 0,
  },
  mutations: {
    increment: ( state, num: number) => {
      state.counter += 1;
    },
    decrement: ( state, num: number) => {
      state.counter -= 1;
    },
  },
  actions: {
    async asyncIncrement(commit, state, num: number) {
      await delay(1000);
      commit.increment(num);
    },
    async asyncDecrement(commit, state, num: number) {
      await delay(1000);
      commit.decrement(num);
    },
  },
});

const Counter = () => {
  const { state, commit, dispatch } = useStore();
  return (
    <>
      <button
        onClick={() => {
          commit.increment(1);
        }}>
       increment
      </button>
      <button
        data-testid="asyncDecrement"
        onClick={() => {
          dispatch.asyncDecrement(1);
        }}>
        asyncDecrement
      </button>
      <div data-testid="counter">{state.counter}</div>
    </>
  );
};

// eslint-disable-next-line react/no-multi-comp
const App = () => (
  <>
    <StoreProvide>
      <Counter />
    </StoreProvide>
  </>
);

describe('test Store', () => {
  afterEach(() => rtl.cleanup());
  jest.useFakeTimers();
  const tester = rtl.render(<App />);
  test('test Store state、mutations、actions', async() => {
    await rtl.act(async() => {
      const button = tester.getByText('increment');
      rtl.fireEvent.click(button);
    });
    expect(tester.getByTestId('counter')).toHaveTextContent('1');
    await rtl.act(async() => {
      const button = tester.getByTestId('asyncDecrement');
      rtl.fireEvent.click(button);
    });
    await rtl.act(async() => {
      jest.advanceTimersByTime(1000);
    });
    expect(tester.getByTestId('counter')).toHaveTextContent('0');
    expect(getState().counter).toBe(0);
  });
});
