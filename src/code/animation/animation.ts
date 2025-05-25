import { IAnimation } from "./types.js";
import assert from "../asserts/assert.js";
import { CrosslyCanvasPattern, ICrosslyCanvasFacade } from "../canvas/types.js";

// TODO: move the canvas so that animation is always visible!!!
// this functionality probably should be in the canvas itself
export class CrosslyCanvasAnimation implements IAnimation {
    private readonly crosslyCanvas: ICrosslyCanvasFacade;
    private readonly pattern: CrosslyCanvasPattern;

    private threadPathIdx: number;
    private dotIdx: number;

    // TODO:
    private timerId?: number;

    constructor(crosslyCanvas: ICrosslyCanvasFacade, pattern: CrosslyCanvasPattern) {
        this.pattern = pattern;
        this.crosslyCanvas = crosslyCanvas;

        this.threadPathIdx = 0;
        this.dotIdx = 0;

        assert.greaterThanZero(pattern.stitch.length, "thread paths must be more than 0");
        const firstThreadPath = this.pattern.stitch[this.threadPathIdx];
        this.crosslyCanvas.useThread(firstThreadPath.name, firstThreadPath.color, firstThreadPath.width);
    }

    public jumpTo(percent: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public manualNext(): Promise<void> {
        const threadPaths = this.pattern.stitch.length;

        if (threadPaths > this.threadPathIdx) {
            const currentThreadPath = this.pattern.stitch[this.threadPathIdx];
            assert.defined(currentThreadPath, "currentThreadPath");

            const threadPathDots = currentThreadPath.length;
            if (threadPathDots !== this.dotIdx) {
                // more dots left (clickDot)

                const dotIdx = {
                    dotX: currentThreadPath.indexesX[this.dotIdx],
                    dotY: currentThreadPath.indexesY[this.dotIdx]
                };

                this.crosslyCanvas.clickDot(dotIdx);
                this.dotIdx += 1;

            } else if (threadPaths > this.threadPathIdx + 1) {
                // switch to the next thread path

                this.threadPathIdx += 1;
                this.dotIdx = 0;

                const nextThreadPath = this.pattern.stitch[this.threadPathIdx];
                this.crosslyCanvas.useThread(nextThreadPath.name, nextThreadPath.color, nextThreadPath.width);
            }
        }

        // TODO: will change when dealing with interruption of animate methods
        return Promise.resolve();
    }

    public manualPrev(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public startAnimate(speed: number): Promise<void> {
        this.timerId = setInterval(() => {
            this.manualNext();
        }, speed);

        // TODO: will change when dealing with interruption of animate methods
        return Promise.resolve();
    }

    public stopAnimate(): Promise<void> {
        if (this.timerId) {
            clearInterval(this.timerId);
        }

        // TODO: will change when dealing with interruption of animate methods
        return Promise.resolve();
    }
}