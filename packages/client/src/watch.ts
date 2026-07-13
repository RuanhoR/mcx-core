import type { Ref, RefValue } from './ref';

type WatchCallback<T extends RefValue> = (newValue: T, oldValue: T) => void;

export function watch<T extends RefValue>(
  source: Ref<T>,
  callback: WatchCallback<T>,
): () => void {
  source.subscribe(callback);
  return () => {
    source.unsubscribe(callback);
  };
}
