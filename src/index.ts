export type DeferredState<T> =
  | Readonly<{ status: 'pending' }>
  | Readonly<{ status: 'fulfilled'; value: T }>
  | Readonly<{ status: 'rejected'; reason: unknown }>;
export interface Deferred<T> {
  readonly promise: Promise<T>;
  readonly state: DeferredState<T>;
  resolve(value: T): boolean;
  reject(reason: unknown): boolean;
  cancel(reason?: unknown): boolean;
}
export class DeferredCancelledError extends Error {
  constructor(reason: unknown) {
    super('Deferred cancelled', { cause: reason });
    this.name = 'DeferredCancelledError';
  }
}
export function createDeferred<T>(signal?: AbortSignal): Deferred<T> {
  let state: DeferredState<T> = Object.freeze({ status: 'pending' });
  let fulfill!: (value: T) => void;
  let fail!: (reason: unknown) => void;
  const promise = new Promise<T>((resolve, reject) => {
    fulfill = resolve;
    fail = reject;
  });
  // Deliberately deferred observation must not create an unhandled internal rejection.
  void promise.catch(() => {});
  const cleanup = () => signal?.removeEventListener('abort', abort);
  const reject = (reason: unknown): boolean => {
    if (state.status !== 'pending') return false;
    state = Object.freeze({ status: 'rejected', reason });
    cleanup();
    fail(reason);
    return true;
  };
  const cancel = (reason?: unknown): boolean => reject(new DeferredCancelledError(reason));
  const abort = () => {
    cancel(signal?.reason);
  };
  const deferred: Deferred<T> = {
    promise,
    get state() {
      return state;
    },
    resolve(value: T): boolean {
      if (state.status !== 'pending') return false;
      try {
        if ((typeof value === 'object' && value !== null) || typeof value === 'function') {
          if (typeof (value as { then?: unknown }).then === 'function')
            throw new TypeError('Deferred resolves plain values, not thenables');
        }
      } catch (error) {
        return reject(error);
      }
      state = Object.freeze({ status: 'fulfilled', value });
      cleanup();
      fulfill(value);
      return true;
    },
    reject,
    cancel,
  };
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  return Object.freeze(deferred);
}
