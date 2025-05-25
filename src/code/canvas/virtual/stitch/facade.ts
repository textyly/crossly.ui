import { StitchCanvas } from "./stitch.js";
import { DotIndex, StitchPattern } from "../../types.js";
import assert from "../../../asserts/assert.js";
import { IStitchCanvasFacade } from "../types.js";
import { IInputCanvas } from "../../input/types.js";
import { StitchCanvasConfig } from "../../../config/types.js";

export class StitchCanvasFacade extends StitchCanvas implements IStitchCanvasFacade {

    constructor(config: StitchCanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public get pattern(): StitchPattern {
        super.ensureAlive();
        return this._pattern;
    }

    public load(pattern: StitchPattern): void {
        super.ensureAlive();
        super.loadPattern(pattern);
    }

    public clickDot(dotIdx: DotIndex): void {
        this.clickDotIndex(dotIdx);
    }

    public useThread(name: string, color: string, width: number): void {
        super.ensureAlive();

        assert.greaterThanZero(name.length, "name.length");
        assert.greaterThanZero(color.length, "color.length");
        assert.greaterThanZero(width, "width");

        super.useNewThread(name, color, width);
    }

    public undo(): void {
        super.ensureAlive();
        super.undoClickDot();
    }

    public redo(): void {
        super.ensureAlive();
        super.redoClickDot();
    }
}