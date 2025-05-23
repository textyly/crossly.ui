import { CueCanvas } from "./cue.js";
import { ICueCanvasFacade } from "../types.js";
import assert from "../../../asserts/assert.js";
import { IInputCanvas } from "../../input/types.js";
import { CueCanvasConfig } from "../../../config/types.js";
import { CuePattern, DotIndex, StitchPattern } from "../../types.js";
import { CueThreadArray } from "../../utilities/arrays/thread/cue.js";

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
        this.loadCore(pattern);
    }

    public useThread(name: string, color: string, width: number): void {
        super.ensureAlive();

        assert.greaterThanZero(name.length, "name.length");
        assert.greaterThanZero(color.length, "color.length");
        assert.greaterThanZero(width, "width");

        super.useNewThread(name, color, width);
    }

    private loadCore(pattern: StitchPattern): void {
        this._pattern = new Array<CueThreadArray>;

        let lastDotIdx: DotIndex | undefined = undefined;

        pattern.forEach((threadPath) => {
            this.useNewThread(threadPath.name, threadPath.color, threadPath.width);

            const thread = this.getCurrentThread();
            assert.defined(thread, "thread");

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

    public undo(): void {
        this.undoClickDot();
    }

    public redo(): void {
        this.redoClickDot();
    }
}