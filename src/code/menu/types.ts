import { Listener, VoidUnsubscribe } from "../types.js";

// TODO: change to thread type
export type Color = string;
export type Colors = Array<Color>;

export interface IMenuHandler {
}

export interface IMenuProvider {
    get zoomLevel(): HTMLElement;
    get actionButtons(): Array<HTMLElement>;
    get colorPalette(): IThreadPalette;
    get backSideContainer(): HTMLElement;
}

export interface IThreadPalette {
    add(threads: Colors): void;
    onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe;
}

// TODO: create thread type
export type ChangeThreadEvent = { name: string, color: Color, width: number };
export type ChangeThreadListener = Listener<ChangeThreadEvent>; 