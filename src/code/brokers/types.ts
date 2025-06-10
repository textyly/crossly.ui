import { VoidListener, VoidUnsubscribe } from "../types.js";

export interface IUiCanvasBroker {
    load(): void; //pattern
    change(color: string): void; // thread
    undo(): void;
    redo(): void;
    zoomIn(): void;
    zoomOut(): void;

    onLoadPattern(listener: VoidListener): VoidUnsubscribe;
    onChangePattern(listener: VoidListener): VoidUnsubscribe;
    onChangeThread(listener: VoidListener): VoidUnsubscribe;
    onChangeZoomIn(listener: VoidListener): VoidUnsubscribe;
    onChangeZoomOut(listener: VoidListener): VoidUnsubscribe;
}

export interface IUiRepositoryBroker {
    save(): void; //pattern
    get(): void; // pattern
    getAll(): void; // patterns
}