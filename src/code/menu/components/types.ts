import { IDisposable, Listener, VoidListener, VoidUnsubscribe } from "../../types.js";

// TODO: change to thread type
export type Color = string;
export type Colors = Array<Color>;

export interface IComponentsProvider extends IDisposable {
    get paletteComponent(): IPaletteComponent;
    get undoComponent(): IUndoComponent;
    get zoomComponent(): IZoomComponent;

    get zoomLevel(): HTMLElement;
    get actionButtons(): Array<HTMLElement>;
    get backSideContainer(): HTMLElement;
}

export interface IPaletteComponent extends IDisposable {
    add(threads: Colors): void;
    onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe;
}

export interface IUndoComponent extends IDisposable {
    onUndo(listener: VoidListener): VoidUnsubscribe;
    onRedo(listener: VoidListener): VoidUnsubscribe;
}

export interface IZoomComponent extends IDisposable {
    zoomIn(): void;
    zoomOut(): void;

    onZoomIn(listener: VoidListener): VoidUnsubscribe;
    onZoomOut(listener: VoidListener): VoidUnsubscribe;
}

// TODO: create thread type
export type ChangeThreadEvent = { name: string, color: Color, width: number };
export type ChangeThreadListener = Listener<ChangeThreadEvent>; 