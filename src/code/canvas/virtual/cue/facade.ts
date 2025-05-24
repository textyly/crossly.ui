import { CueCanvas } from "./cue.js";
import { ICueCanvasFacade } from "../types.js";
import assert from "../../../asserts/assert.js";
import { IInputCanvas } from "../../input/types.js";
import { CueCanvasConfig } from "../../../config/types.js";
import { CuePattern, StitchPattern } from "../../types.js";

export class CueCanvasFacade extends CueCanvas implements ICueCanvasFacade {

    constructor(config: CueCanvasConfig, input: IInputCanvas) {
        super(CueCanvasFacade.name, config, input);
    }

    public get pattern(): CuePattern {
        super.ensureAlive();
        return this._pattern;
    }

    public load(pattern: StitchPattern): void {
        super.ensureAlive();
        super.loadPattern(pattern);
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