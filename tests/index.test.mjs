import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as library from '../dist/esm/index.js';
const { DeferredCancelledError, createDeferred } = library;

test('plain fulfillment exposes immutable inspected state', async () => {
  const d = createDeferred();
  assert.deepEqual(d.state, { status: 'pending' });
  assert.equal(d.resolve(4), true);
  assert.equal(await d.promise, 4);
  assert.deepEqual(d.state, { status: 'fulfilled', value: 4 });
  assert.equal(Object.isFrozen(d.state), true);
});
test('first settlement wins', async () => {
  const d = createDeferred();
  d.resolve('first');
  assert.equal(d.resolve('second'), false);
  assert.equal(d.reject('late'), false);
  assert.equal(d.cancel(), false);
  assert.equal(await d.promise, 'first');
});
test('rejection preserves undefined', async () => {
  const d = createDeferred();
  d.reject(undefined);
  assert.equal(d.state.status, 'rejected');
  let caught = false;
  try {
    await d.promise;
  } catch (e) {
    caught = true;
    assert.equal(e, undefined);
  }
  assert.equal(caught, true);
});
test('cancellation carries cause', async () => {
  const d = createDeferred();
  d.cancel('stop');
  await assert.rejects(d.promise, (e) => e instanceof DeferredCancelledError && e.cause === 'stop');
  assert.equal(d.resolve(1), false);
});
test('preabort and later abort settle without internal unhandled branch', async () => {
  const c = new AbortController();
  c.abort('pre');
  const d = createDeferred(c.signal);
  await assert.rejects(d.promise, DeferredCancelledError);
  const c2 = new AbortController();
  const d2 = createDeferred(c2.signal);
  d2.resolve(8);
  c2.abort();
  assert.equal(await d2.promise, 8);
  const c3 = new AbortController();
  const d3 = createDeferred(c3.signal);
  c3.abort('later');
  await assert.rejects(d3.promise, (e) => e.cause === 'later');
});
test('thenables and throwing then getters reject honestly', async () => {
  const d = createDeferred();
  d.resolve(Promise.resolve(2));
  await assert.rejects(d.promise, TypeError);
  assert.equal(d.state.status, 'rejected');
  const e = createDeferred();
  const reason = {};
  e.resolve({
    get then() {
      throw reason;
    },
  });
  await assert.rejects(e.promise, (x) => x === reason);
});
