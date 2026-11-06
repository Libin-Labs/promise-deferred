import { createDeferred, type DeferredState } from '@lp-labs/promise-deferred';
const d = createDeferred<number>();
d.resolve(3);
const state: DeferredState<number> = d.state;
void state;
// @ts-expect-error number only
d.resolve('3');
// @ts-expect-error readonly inspection
d.state = { status: 'pending' };
