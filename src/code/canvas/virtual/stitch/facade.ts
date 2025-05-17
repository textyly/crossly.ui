import { StitchCanvas } from "./stitch.js";
import { StitchPattern } from "../../types.js";
import assert from "../../../asserts/assert.js";
import { IStitchCanvasFacade } from "../types.js";
import { IInputCanvas } from "../../input/types.js";
import { StitchCanvasConfig } from "../../../config/types.js";

export class StitchCanvasFacade extends StitchCanvas implements IStitchCanvasFacade {

    constructor(config: StitchCanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public get pattern(): StitchPattern {
        return this._pattern;
    }

    public load(pattern: StitchPattern): void {
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