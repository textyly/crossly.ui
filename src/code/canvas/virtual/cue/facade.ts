import { CueCanvas } from "./cue.js";
import { CuePattern, StitchPattern } from "../../types.js";
import { ICueCanvasFacade } from "../types.js";
import assert from "../../../asserts/assert.js";
import { IInputCanvas } from "../../input/types.js";
import { CueCanvasConfig } from "../../../config/types.js";
import { CueThreadArray } from "../../utilities/arrays/thread/cue.js";

export class CueCanvasFacade extends CueCanvas implements ICueCanvasFacade {

    constructor(config: CueCanvasConfig, input: IInputCanvas) {
        super(CueCanvasFacade.name, config, input);
    }

    public get pattern(): CuePattern {
        return this._pattern;
    }

    public load(pattern: StitchPattern): void {
        this._pattern = new Array<CueThreadArray>;

        pattern.forEach((threadPath) => {
            super.createThread(threadPath.color, threadPath.width);

            const thread = super.getCurrentThread()!;
            for (let index = 0; index < threadPath.length; index++) {
                const indexX = threadPath.indexesX[index];
                const indexY = threadPath.indexesY[index];
                thread.pushDotIndex(indexX, indexY);
            }
        });
    }

    public useThread(name: string, color: string, width: number): void {
        super.ensureAlive();

        assert.greaterThanZero(name.length, "name.length");
        assert.greaterThanZero(color.length, "color.length");
        assert.greaterThanZero(width, "width");

        super.useNewThread(name, color, width);
    }
}