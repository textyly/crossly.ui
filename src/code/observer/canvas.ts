import { Base } from "../base.js";
import assert from "../asserts/assert.js";
import { VoidUnsubscribe } from "../types.js";
import { ICrosslyCanvas } from "../canvas/types.js";
import { ChangeListener, ICrosslyCanvasObserver } from "./types.js";
import { ChangeFabricEvent, ChangeStitchPatternEvent } from "../canvas/virtual/types.js";

export class CrosslyCanvasObserver extends Base implements ICrosslyCanvasObserver {
    private readonly canvas: ICrosslyCanvas;

    constructor(canvas: ICrosslyCanvas) {
        super(CrosslyCanvasObserver.name);

        this.canvas = canvas;
        this.subscribe();
    }

    public onChange(listener: ChangeListener): VoidUnsubscribe {
        super.ensureAlive();

        throw new Error("Method not implemented.");
    }

    private handleChangeFabric(event: ChangeFabricEvent): void {
        super.ensureAlive();
        assert.defined(event, "ChangeFabricEvent");
        assert.defined(event.fabric, "Fabric");

        throw new Error("Method not implemented.");
    }

    private handleChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        super.ensureAlive();
        assert.defined(event, "ChangeStitchPatternEvent");
        assert.defined(event.pattern, "StitchPattern");

        throw new Error("Method not implemented.");
    }

    private subscribe() {
        const unChangeFabric = this.canvas.onChangeFabric(this.handleChangeFabric.bind(this));
        super.registerUn(unChangeFabric);

        const unChangeStitchPattern = this.canvas.onChangeStitchPattern(this.handleChangeStitchPattern.bind(this));
        super.registerUn(unChangeStitchPattern);
    }
}