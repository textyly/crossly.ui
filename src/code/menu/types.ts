import { IDisposable, Listener, VoidUnsubscribe } from "../types.js";

// TODO: change to thread type
export type Color = string;
export type Colors = Array<Color>;

export interface IMenuHandler {
}

export interface IMenuProvider extends IDisposable {
    get threadPalette(): IThreadPalette;

    get zoomLevel(): HTMLElement;
    get actionButtons(): Array<HTMLElement>;
    get backSideContainer(): HTMLElement;
}

export interface IThreadPalette extends IDisposable {
    add(threads: Colors): void;
    onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe;
}

// TODO: create thread type
export type ChangeThreadEvent = { name: string, color: Color, width: number };
export type ChangeThreadListener = Listener<ChangeThreadEvent>; 