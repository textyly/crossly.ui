import { IAnimation } from "./types.js";
import assert from "../asserts/assert.js";
import { IStitchThreadPath } from "../canvas/utilities/arrays/types.js";
import { CrosslyCanvasPattern, ICrosslyCanvasFacade, StitchPattern } from "../canvas/types.js";

export class CrosslyCanvasAnimation implements IAnimation {
    private readonly crosslyCanvas: ICrosslyCanvasFacade;
    private readonly pattern: CrosslyCanvasPattern;

    private threadPathIdx!: number;
    private dotIdx!: number;

    private timerId?: number;

    constructor(crosslyCanvas: ICrosslyCanvasFacade, pattern: CrosslyCanvasPattern) {
        this.pattern = pattern;
        this.crosslyCanvas = crosslyCanvas;

        this.addFirstThread(this.pattern.stitch);
    }

    public jumpTo(percent: number): void {
        this.stopAnimate();
        this.jumpToCore(percent);
    }

    public manualNext(): void {
        this.stopAnimate();

        const stitchPattern = this.pattern.stitch;
        const currentThreadPath = stitchPattern[this.threadPathIdx];
        assert.defined(currentThreadPath, "currentThreadPath");

        this.manualNextCore(stitchPattern, currentThreadPath);
    }

    public manualPrev(): void {
        this.stopAnimate();

        const stitchPattern = this.pattern.stitch;
        const currentThreadPath = stitchPattern[this.threadPathIdx];
        assert.defined(currentThreadPath, "currentThreadPath");

        this.manualPrevCore(stitchPattern);
    }

    public startForwardAnimate(speed: number): void {
        this.stopAnimate();
        this.startForwardAnimateCore(speed);
    }

    public startBackwardAnimate(speed: number): void {
        this.stopAnimate();
        this.startBackwardAnimateCore(speed);
    }

    public stopAnimate(): void {
        if (this.timerId) {
            this.stopAnimateCore(this.timerId);
            this.timerId = undefined;
        }
    }

    private jumpToCore(percent: number): void {
        // TODO: create a new animation (a new crossly canvas as well) and jump to the given percentage

        const stitchPattern = this.pattern.stitch;
        const patternLength = this.calculatePatternLength(stitchPattern);

        const dot = this.calculatePercentage(percent, patternLength);
        for (let index = 0; index < dot; index++) {
            this.manualNext(); // TODO: add the part of the pattern (corresponding on the given percentage) directly using load method
        }
    }

    private manualNextCore(stitchPattern: StitchPattern, currentThreadPath: IStitchThreadPath): boolean {
        let hasNext = false;
        const threadPaths = stitchPattern.length;
        const threadPathDots = currentThreadPath.length;

        if (this.dotIdx < threadPathDots) {

            this.crossNextHole(currentThreadPath, this.dotIdx);

            this.dotIdx += 1;
            hasNext = true;

        } else if (this.threadPathIdx < threadPaths - 1) {

            this.useNewThread(stitchPattern, this.threadPathIdx + 1);

            this.threadPathIdx += 1;
            this.dotIdx = 0;
            hasNext = true;
        }

        return hasNext;
    }

    private manualPrevCore(stitchPattern: StitchPattern): boolean {
        let hasNext = false;

        if (this.dotIdx > 0) {

            this.uncrossCurrentHole();

            this.dotIdx -= 1;
            hasNext = true;

        } else if (this.threadPathIdx > 0) {

            this.unuseCurrentThread();

            this.threadPathIdx -= 1;
            const previousThreadPath = stitchPattern[this.threadPathIdx];

            this.dotIdx = previousThreadPath.length;
            hasNext = true;
        }

        return hasNext;
    }

    private startForwardAnimateCore(speed: number): void {
        this.timerId = setInterval(() => {
            const stitchPattern = this.pattern.stitch;

            const currentThreadPath = stitchPattern[this.threadPathIdx];
            assert.defined(currentThreadPath, "currentThreadPath");

            const hasNext = this.manualNextCore(stitchPattern, currentThreadPath);
            if (!hasNext) {
                this.stopAnimate();
            }
        }, speed);
    }

    private startBackwardAnimateCore(speed: number): void {
        this.timerId = setInterval(() => {
            const stitchPattern = this.pattern.stitch;

            const currentThreadPath = stitchPattern[this.threadPathIdx];
            assert.defined(currentThreadPath, "currentThreadPath");

            const hasNext = this.manualPrevCore(stitchPattern);
            if (!hasNext) {
                this.stopAnimate();
            }
        }, speed);
    }

    private stopAnimateCore(timerId: number): void {
        clearInterval(timerId);
    }

    private addFirstThread(stitchPattern: StitchPattern): void {
        assert.greaterThanZero(stitchPattern.length, "stitch thread paths must be more than 0");

        this.threadPathIdx = 0;
        this.dotIdx = 0;

        const firstThreadPath = stitchPattern[this.threadPathIdx];
        this.crosslyCanvas.useThread(firstThreadPath.name, firstThreadPath.color, firstThreadPath.width);
    }

    private crossNextHole(threadPath: IStitchThreadPath, dot: number): void {
        const dotIdx = {
            dotX: threadPath.indexesX[dot],
            dotY: threadPath.indexesY[dot]
        };

        this.crosslyCanvas.clickDot(dotIdx);
    }

    private useNewThread(stitchPattern: StitchPattern, nextThreadPathIdx: number): void {
        const nextThreadPath = stitchPattern[nextThreadPathIdx];
        this.crosslyCanvas.useThread(nextThreadPath.name, nextThreadPath.color, nextThreadPath.width);
    }

    private uncrossCurrentHole(): void {
        this.crosslyCanvas.undo();
    }

    private unuseCurrentThread(): void {
        this.crosslyCanvas.undo();
    }

    private calculatePatternLength(stitchPattern: StitchPattern): number {
        let length = 0;

        stitchPattern.forEach((threadPath) => {
            const dots = threadPath.length + 1; // add 1 for adding a thread
            length += dots;
        });

        return length;
    }

    private calculatePercentage(percent: number, total: number): number {
        const percentage = (percent / 100) * total;
        return Math.floor(percentage);
    }
}