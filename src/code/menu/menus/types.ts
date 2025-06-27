import { IDisposable, Listener, VoidListener, VoidUnsubscribe } from "../../types.js";

// TODO: change to thread type
export type Color = string;
export type Colors = Array<Color>;

export interface IMenus extends IDisposable {
    get home(): IHomeMenu;
    //get user(): IUserMenu;
    get undo(): IUndoMenu;
    get zoom(): IZoomMenu;
    get palette(): IPaletteMenu;
    get splitView(): ISplitViewMenu;
    get close(): ICloseMenu;
    //get feedback(): IFeedbackMenu;
}

export interface IHomeMenu extends IDisposable {
    onOpenHome(listener: VoidListener): VoidUnsubscribe;
}

export interface IUserMenu extends IDisposable {
    onOpenUser(listener: VoidListener): VoidUnsubscribe;
}

export interface IPaletteMenu extends IDisposable {
    add(threads: Colors): void;

    onChangeThread(listener: ChangeThreadListener): VoidUnsubscribe;
    onOpenThreadPicker(listener: VoidListener): VoidUnsubscribe;
}

export interface IUndoMenu extends IDisposable {
    onUndo(listener: VoidListener): VoidUnsubscribe;
    onRedo(listener: VoidListener): VoidUnsubscribe;
}

export interface IZoomMenu extends IDisposable {
    zoomIn(): void;
    zoomOut(): void;

    onZoomIn(listener: VoidListener): VoidUnsubscribe;
    onZoomOut(listener: VoidListener): VoidUnsubscribe;
}

export interface ISplitViewMenu extends IDisposable {
    onToggleSplitView(listener: VoidListener): VoidUnsubscribe;
}

export interface ICloseMenu extends IDisposable {
    onClose(listener: VoidListener): VoidUnsubscribe;
}

export interface IFeedbackMenu extends IDisposable {
    onFeedback(listener: VoidListener): VoidUnsubscribe;
}

// TODO: create thread type
export type ChangeThreadEvent = { name: string, color: Color, width: number };
export type ChangeThreadListener = Listener<ChangeThreadEvent>; 