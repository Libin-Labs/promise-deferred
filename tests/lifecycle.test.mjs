import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import { createDeferred } from '../dist/esm/index.js';

test('settlement detaches cancellation listener and old state stays immutable', async () => {
  const controller = new AbortController();
  const deferred = createDeferred(controller.signal);
  const before = deferred.state;
  assert.equal(getEventListeners(controller.signal, 'abort').length, 1);
  deferred.resolve(4);
  assert.equal(getEventListeners(controller.signal, 'abort').length, 0);
  assert.deepEqual(before, { status: 'pending' });
  assert.equal(await deferred.promise, 4);
});

test('unobserved rejection sink does not alter consumer rejection or emit unhandled event', async () => {
  const unhandled = [];
  const observer = (error) => unhandled.push(error);
  process.on('unhandledRejection', observer);
  try {
    const deferred = createDeferred();
    deferred.reject(undefined);
    await new Promise(setImmediate);
    assert.deepEqual(unhandled, []);
    let failed = false;
    try {
      await deferred.promise;
    } catch (error) {
      failed = true;
      assert.equal(error, undefined);
    }
    assert.equal(failed, true);
  } finally {
    process.off('unhandledRejection', observer);
  }
});
