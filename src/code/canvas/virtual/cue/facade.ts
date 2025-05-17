import { CueCanvas } from "./cue.js";
import { CuePattern } from "../../types.js";
import { ICueCanvasFacade } from "../types.js";
import assert from "../../../asserts/assert.js";
import { IInputCanvas } from "../../input/types.js";
import { CueCanvasConfig } from "../../../config/types.js";

export class CueCanvasFacade extends CueCanvas implements ICueCanvasFacade {

    constructor(config: CueCanvasConfig, input: IInputCanvas) {
        super(CueCanvasFacade.name, config, input);
    }

    public get pattern(): CuePattern {
        return this._pattern;
    }

    public load(pattern: CuePattern): void {
        throw new Error("Method not implemented.");
    }

    public useThread(color: string, width: number): void {
        super.ensureAlive();

        assert.defined(color, "color");
        assert.greaterThanZero(color.length, "color.length");

        assert.defined(width, "width");
        assert.greaterThanZero(width, "width");

        super.useNewThread(color, width);
    }
}