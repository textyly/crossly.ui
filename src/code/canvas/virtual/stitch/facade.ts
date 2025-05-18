import { StitchCanvas } from "./stitch.js";
import { CanvasSide, DotIndex, StitchPattern } from "../../types.js";
import assert from "../../../asserts/assert.js";
import { IStitchCanvasFacade } from "../types.js";
import { IInputCanvas } from "../../input/types.js";
import { StitchCanvasConfig } from "../../../config/types.js";
import { ThreadPath } from "../../utilities/arrays/thread/stitch.js";

export class StitchCanvasFacade extends StitchCanvas implements IStitchCanvasFacade {

    constructor(config: StitchCanvasConfig, input: IInputCanvas) {
        super(config, input);
    }

    public get pattern(): StitchPattern {
        return this._pattern;
    }

    public load(pattern: StitchPattern): void {
        this._pattern = new Array<ThreadPath>();

        let lastDotIdx: DotIndex | undefined = undefined;
        
        pattern.forEach((threadPath) => {
            this.useNewThread(threadPath.name, threadPath.color, threadPath.width);

            const thread = this.getCurrentThread()!;
            for (let index = 0; index < threadPath.length; index++) {
                const indexX = threadPath.indexesX[index];
                const indexY = threadPath.indexesY[index];
                thread.pushDotIndex(indexX, indexY);

                this.changeCanvasSide();
                lastDotIdx = { dotX: indexX, dotY: indexY };
            }
        });

        this.clickedDotIdx = lastDotIdx;
    }

    public useThread(name: string, color: string, width: number): void {
        super.ensureAlive();

        assert.greaterThanZero(name.length, "name.length");
        assert.greaterThanZero(color.length, "color.length");
        assert.greaterThanZero(width, "width");

        super.useNewThread(name, color, width);
    }
}