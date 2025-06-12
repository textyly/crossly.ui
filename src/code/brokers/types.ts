import { VoidListener, VoidUnsubscribe } from "../types.js";
import { ChangeStitchPatternListener } from "../canvas/virtual/types.js";

export interface IMenuCanvasBroker {
    load(): void; //pattern
    change(color: string): void; // thread
    undo(): void;
    redo(): void;
    zoomIn(): void;
    zoomOut(): void;

    onChangePattern(listener: ChangeStitchPatternListener): VoidUnsubscribe;
    onZoomIn(listener: VoidListener): VoidUnsubscribe;
    onZoomOut(listener: VoidListener): VoidUnsubscribe;
}

export interface IMenuRepositoryBroker {
    save(): void; //pattern
    get(): void; // pattern
    getAll(): void; // patterns
}