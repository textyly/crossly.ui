import { IMenuCanvasBroker } from "./types.js";
import { ICrosslyCanvasFacade } from "../canvas/types.js";
import { VoidListener, VoidUnsubscribe } from "../types.js";
import { ChangeStitchPatternListener } from "../canvas/virtual/types.js";

export class UiCanvasBroker implements IMenuCanvasBroker {
    private canvas: ICrosslyCanvasFacade;

    constructor(canvas: ICrosslyCanvasFacade) {
        this.canvas = canvas;
    }

    public load(): void {
        throw new Error("Method not implemented.");
    }

    public change(color: string): void {
        this.canvas.useThread("test", color, 12); // TODO: current thread width!!!
    }

    public undo(): void {
        this.canvas.undo();
    }

    public redo(): void {
        this.canvas.redo();
    }

    public zoomIn(): void {
        this.canvas.zoomIn();
    }

    public zoomOut(): void {
        this.canvas.zoomOut();
    }

    public onChangePattern(listener: ChangeStitchPatternListener): VoidUnsubscribe {
        return this.canvas.onChangeStitchPattern(listener);
    }

    public onZoomIn(listener: VoidListener): VoidUnsubscribe {
        return this.canvas.onZoomIn(listener);
    }

    public onZoomOut(listener: VoidListener): VoidUnsubscribe {
        return this.canvas.onZoomOut(listener);
    }
}