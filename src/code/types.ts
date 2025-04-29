export type VoidData = {};
export type VoidEvent = VoidData;

export interface IDisposable {
    dispose(): void;
}

export type Listener<T> = (event: T) => void;
export type VoidListener = Listener<VoidData>;
export type ErrorListener = Listener<unknown>;
export type Unsubscribe<T> = () => Listener<T>;
export type VoidUnsubscribe = Unsubscribe<VoidListener>;