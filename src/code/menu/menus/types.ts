import { IDisposable, Listener, VoidListener, VoidUnsubscribe } from "../../types.js";

export type Threads = Array<Thread>;

export interface IMenus extends IDisposable {
    get home(): IHomeMenu;
    get user(): IUserMenu;
    get undo(): IUndoMenu;
    get zoom(): IZoomMenu;
    get threadPalette(): IThreadPaletteMenu;
    get splitView(): ISplitViewMenu;
    get close(): ICloseMenu;
    get feedback(): IFeedbackMenu;
}

export interface IHomeMenu extends IDisposable {
    onOpenHome(listener: VoidListener): VoidUnsubscribe;
}

export interface IUserMenu extends IDisposable {
    onOpenUser(listener: VoidListener): VoidUnsubscribe;
}

export interface IThreadPaletteMenu extends IDisposable {
    add(threads: Threads): void;
    change(thread: Thread): void;

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

export type Thread = { name: string, color: string, width: number };
export type ChangeThreadEvent = { thread: Thread };
export type ChangeThreadListener = Listener<ChangeThreadEvent>; 