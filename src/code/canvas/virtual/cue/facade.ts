import { CueCanvas } from "./cue.js";
import { ICueCanvasFacade } from "../types.js";
import assert from "../../../asserts/assert.js";
import { IInputCanvas } from "../../input/types.js";
import { CueCanvasConfig } from "../../../config/types.js";

export class CueCanvasFacade extends CueCanvas implements ICueCanvasFacade {
    constructor(config: CueCanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public useNewThread(color: string, width: number): void {
        super.ensureAlive();

        assert.defined(color, "color");
        assert.greaterThanZero(color.length, "color.length");

        assert.defined(width, "width");
        assert.greaterThanZero(width, "width");

        super.useNewThread(color, width);
    }
}