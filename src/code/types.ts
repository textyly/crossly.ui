export type Listener<T> = (event: T) => void;
export type VoidListener = Listener<void>;
export type ErrorListener = Listener<unknown>;
export type Unsubscribe<T> = () => Listener<T> | undefined;
export type VoidUnsubscribe = Unsubscribe<VoidListener>;