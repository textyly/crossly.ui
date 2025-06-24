import { IDisposable, Listener, VoidUnsubscribe } from "../../types.js";

// TODO: change to thread type
export type Color = string;
export type Colors = Array<Color>;

export interface IPaletteComponent extends IDisposable {
    add(threads: Colors): void;
    onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe;
}

export interface IUndo extends IDisposable {
}

// TODO: create thread type
export type ChangeThreadEvent = { name: string, color: Color, width: number };
export type ChangeThreadListener = Listener<ChangeThreadEvent>; 