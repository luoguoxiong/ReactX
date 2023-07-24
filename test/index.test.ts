import { isObject, isAsyncFunction, isFunction, cloneObj } from '../src/utils';

test('isObject', () => {
  expect(isObject({})).toBe(true);
});

test('isAsyncFunction', () => {
  expect(isAsyncFunction(async function() {})).toBe(false);
});

test('isFunction', () => {
  expect(isFunction(() => {})).toBe(true);
});

test('cloneObj', () => {
  const obj = {
    a: {
      b: 2,
    },
  };
  expect(JSON.stringify( cloneObj(obj))).toBe(JSON.stringify(obj));

  expect(cloneObj(new Number(0))).toBe(undefined);
});


