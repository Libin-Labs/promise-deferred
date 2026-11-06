# @lp-labs/promise-deferred

Inspectable single-settlement deferred with cooperative signal cancellation.

## Install

```sh
npm install @lp-labs/promise-deferred
```

Zero runtime, peer, or sibling dependencies. Node 18+; strict TypeScript declarations and independent ESM/CommonJS builds. Version 0.1.0, MIT.

## Quickstart

```js
import { createDeferred } from '@lp-labs/promise-deferred';
const deferred = createDeferred();
deferred.resolve('ready');
console.log(await deferred.promise, deferred.state.status); // ready fulfilled
```

## API and contracts

createDeferred<T>(signal?) returns a frozen Deferred with promise, readonly discriminated state, and boolean resolve/reject/cancel (true only for the first settlement). Values are plain, non-thenable values: thenables and throwing then accessors settle rejected rather than exposing a falsely fulfilled inspected state. State snapshots are shallow frozen, not deep copies. reject preserves arbitrary reasons including undefined. cancel and signal abort use DeferredCancelledError.cause; listeners are removed on settlement. An intentional internal catch sink prevents unobserved rejection warnings while the original promise still rejects to consumers. No timeout or real timers, no underlying task cancellation. O(1) state; settlement does not mutate prior snapshots.

## Full declarations

The complete public declarations below are generated from the package's strict source. All runtime exports, interfaces, options, return types and readonly state are listed here.

<!-- declarations -->

```ts
export type DeferredState<T> =
  | Readonly<{
      status: 'pending';
    }>
  | Readonly<{
      status: 'fulfilled';
      value: T;
    }>
  | Readonly<{
      status: 'rejected';
      reason: unknown;
    }>;
export interface Deferred<T> {
  readonly promise: Promise<T>;
  readonly state: DeferredState<T>;
  resolve(value: T): boolean;
  reject(reason: unknown): boolean;
  cancel(reason?: unknown): boolean;
}
export declare class DeferredCancelledError extends Error {
  constructor(reason: unknown);
}
export declare function createDeferred<T>(signal?: AbortSignal): Deferred<T>;
```

<!-- end declarations -->

## Development

```sh
npm ci --offline
npm run build
npm run typecheck
npm test
npm run format:check
```

All tests use deterministic clocks, immediate injected sleeps, or explicit promise gates rather than timing guesses. Package exports select ESM for import and CommonJS for require, with separate declaration trees. No runtime configuration files or global hooks.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
