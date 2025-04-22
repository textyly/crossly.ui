import { VoidUnsubscribe } from "../types.js";
import { ICrosslyCanvas } from "../canvas/types.js";
import { ChangeListener, ICrosslyCanvasObserver } from "./types.js";
import { ChangeFabricEvent, ChangeStitchPatternEvent } from "../canvas/virtual/types.js";

export class CrosslyCanvasObserver implements ICrosslyCanvasObserver {
    private canvas: ICrosslyCanvas;

    constructor(canvas: ICrosslyCanvas) {
        this.canvas = canvas;
        this.subscribe();
    }

    public onChange(listener: ChangeListener): VoidUnsubscribe {
        throw new Error("Method not implemented.");
    }

    private handleChangeFabric(event: ChangeFabricEvent): void {
        throw new Error("Method not implemented.");
    }

    private handleChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        throw new Error("Method not implemented.");
    }

    private subscribe() {
        const unChangeFabric = this.canvas.onChangeFabric(this.handleChangeFabric.bind(this));
        // TODO: unsubscribe

        const unChangeStitchPattern = this.canvas.onChangeStitchPattern(this.handleChangeStitchPattern.bind(this));
        // TODO: unsubscribe
    }
}