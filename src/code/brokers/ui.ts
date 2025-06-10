import { IUiCanvasBroker } from "./types.js";
import { ICrosslyCanvasFacade } from "../canvas/types.js";
import { VoidListener, VoidUnsubscribe } from "../types.js";

export class UiCanvasBroker implements IUiCanvasBroker {
    private canvas: ICrosslyCanvasFacade;

    constructor(canvas: ICrosslyCanvasFacade) {
        this.canvas = canvas;
    }

    public load(): void {
        throw new Error("Method not implemented.");
    }

    public change(color: string): void {
        this.canvas.useThread("test", color, 10); // TODO: current thread width!!!
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

    public onLoadPattern(listener: VoidListener): VoidUnsubscribe {
        throw new Error("Method not implemented.");
    }

    public onChangePattern(listener: VoidListener): VoidUnsubscribe {
        throw new Error("Method not implemented.");
    }

    public onChangeThread(listener: VoidListener): VoidUnsubscribe {
        throw new Error("Method not implemented.");
    }

    public onZoomIn(listener: VoidListener): VoidUnsubscribe {
        return this.canvas.onZoomIn(listener);
    }

    public onZoomOut(listener: VoidListener): VoidUnsubscribe {
        return this.canvas.onZoomOut(listener);
    }
}