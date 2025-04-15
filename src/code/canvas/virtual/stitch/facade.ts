import { StitchCanvas } from "./stitch.js";
import assert from "../../../asserts/assert.js";
import { IStitchCanvasFacade } from "../types.js";
import { IInputCanvas } from "../../input/types.js";
import { StitchCanvasConfig } from "../../../config/types.js";

export class StitchCanvasFacade extends StitchCanvas implements IStitchCanvasFacade {
    constructor(config: StitchCanvasConfig, input: IInputCanvas) {
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