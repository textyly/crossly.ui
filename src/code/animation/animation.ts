import { IAnimation } from "./types.js";
import assert from "../asserts/assert.js";
import { CrosslyCanvasPattern, ICrosslyCanvasFacade } from "../canvas/types.js";

// TODO: front and back inputs must be completely disabled!!!

// TODO: move the canvas so that animation is always visible!!!
// this functionality probably should be in the canvas itself
export class CrosslyCanvasAnimation implements IAnimation {
    private readonly crosslyCanvas: ICrosslyCanvasFacade;
    private readonly pattern: CrosslyCanvasPattern;

    private threadPathIdx: number;
    private dotIdx: number;

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

    public jumpTo(percent: number): void {
        this.stopAnimate();
        this.jumpToCore(percent);
    }

    public manualNext(): void {
        this.stopAnimate();
        this.manualNextCore();
    }

    public manualPrev(): void {
        this.stopAnimate();
        this.manualPrevCore();
    }

    public startAnimate(speed: number): void {
        this.stopAnimate();
        this.startAnimateCore(speed);
    }

    public stopAnimate(): void {
        if (this.timerId) {
            this.stopAnimateCore(this.timerId);
            this.timerId = undefined;
        }
    }

    private jumpToCore(percent: number): void {
        throw new Error("Method not implemented.");
    }

    private manualNextCore(): boolean {
        let hasNext = false;
        const threadPaths = this.pattern.stitch.length;

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

            hasNext = true;

        } else if (threadPaths > this.threadPathIdx + 1) {
            // switch to the next thread path

            this.threadPathIdx += 1;
            this.dotIdx = 0;

            const nextThreadPath = this.pattern.stitch[this.threadPathIdx];
            this.crosslyCanvas.useThread(nextThreadPath.name, nextThreadPath.color, nextThreadPath.width);

            hasNext = true;
        }

        return hasNext;
    }

    private manualPrevCore(): boolean {
        throw new Error("Method not implemented.");
    }

    private startAnimateCore(speed: number): void {
        this.timerId = setInterval(() => {
            const hasNext = this.manualNextCore();
            if (!hasNext) {
                this.stopAnimate();
            }
        }, speed);
    }

    private stopAnimateCore(timerId: number): void {
        clearInterval(timerId);
    }
}