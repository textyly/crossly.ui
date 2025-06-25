import { IDisposable, Listener, VoidListener, VoidUnsubscribe } from "../../types.js";

// TODO: change to thread type
export type Color = string;
export type Colors = Array<Color>;

export interface IMenuComponents extends IDisposable {
    get undo(): IMenuUndoComponent;
    get zoom(): IMenuZoomComponent;
    get palette(): IMenuPaletteComponent;
    get splitView(): IMenuSplitViewComponent;
    get close(): IMenuCloseComponent;
}

export interface IMenuPaletteComponent extends IDisposable {
    add(threads: Colors): void;
    onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe;
}

export interface IMenuUndoComponent extends IDisposable {
    onUndo(listener: VoidListener): VoidUnsubscribe;
    onRedo(listener: VoidListener): VoidUnsubscribe;
}

export interface IMenuZoomComponent extends IDisposable {
    zoomIn(): void;
    zoomOut(): void;

    onZoomIn(listener: VoidListener): VoidUnsubscribe;
    onZoomOut(listener: VoidListener): VoidUnsubscribe;
}

export interface IMenuSplitViewComponent extends IDisposable {
    onToggleSplitView(listener: VoidListener): VoidUnsubscribe;
}

export interface IMenuCloseComponent extends IDisposable {
    onClose(listener: VoidListener): VoidUnsubscribe;
}

// TODO: create thread type
export type ChangeThreadEvent = { name: string, color: Color, width: number };
export type ChangeThreadListener = Listener<ChangeThreadEvent>; 