import { IAnimation } from "./types.js";
import assert from "../asserts/assert.js";
import { IStitchThreadPath } from "../canvas/utilities/arrays/types.js";
import { StitchThreadPath } from "../canvas/utilities/arrays/thread/stitch.js";
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
        assert.greaterThanZero(percent, "percent");
        assert.that(percent <= 100, "percent must be less than or equal to 100.");

        this.assertValidState();
        this.stopAnimating();
        this.jumpToCore(percent);
    }

    public manualNext(): void {
        this.assertValidState();
        this.stopAnimating();
        this.manualNextCore();
    }

    public manualPrev(): void {
        this.assertValidState();
        this.stopAnimating();
        this.manualPrevCore();
    }

    public startAnimatingForward(speed: number): void {
        assert.greaterThanZero(speed, "speed");

        this.assertValidState();
        this.stopAnimating();
        this.startAnimatingForwardCore(speed);
    }

    public startAnimatingBackward(speed: number): void {
        assert.greaterThanZero(speed, "speed");

        this.assertValidState();
        this.stopAnimating();
        this.startAnimatingBackwardCore(speed);
    }

    public stopAnimating(): void {
        this.assertValidState();
        if (this.timerId) {
            this.stopAnimateCore(this.timerId);
            this.timerId = undefined;
        }
    }

    private jumpToCore(percent: number): void {
        const stitchPattern = this.pattern.stitch;
        const patternLength = this.calculatePatternLength(stitchPattern);
        const lastDot = this.calculatePercentage(percent, patternLength);

        const partialStitchPattern = new Array<IStitchThreadPath>();

        let index = 0;
        this.dotIdx = 0;
        this.threadPathIdx = 0;

        for (let threadPathIdx = 0; threadPathIdx < stitchPattern.length; threadPathIdx++) {

            if (index > lastDot) {
                break;
            }

            const threadPath = stitchPattern[threadPathIdx];
            const newThreadPath = new StitchThreadPath(threadPath.name, threadPath.color, threadPath.width);
            partialStitchPattern.push(newThreadPath);
            index += 1;

            const indexesX = threadPath.indexesX;
            const indexesY = threadPath.indexesY;

            for (let dotIdx = 0; dotIdx < threadPath.length; dotIdx++) {

                if (index > lastDot) {
                    break;
                }

                const indexX = indexesX[dotIdx];
                const indexY = indexesY[dotIdx];

                newThreadPath.pushDotIndex(indexX, indexY);
                index += 1;
            }
        }

        const partialCanvasPattern = { name: this.pattern.name, fabric: this.pattern.fabric, stitch: partialStitchPattern };
        this.crosslyCanvas.load(partialCanvasPattern);
        this.crosslyCanvas.draw();

        this.threadPathIdx = partialStitchPattern.length - 1;
        this.dotIdx = partialStitchPattern[this.threadPathIdx].length - 1;
    }

    private manualNextCore(): boolean {
        let hasNext = false;
        const stitchPattern = this.pattern.stitch;
        const currentThreadPath = stitchPattern[this.threadPathIdx];
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

    private manualPrevCore(): boolean {
        let hasNext = false;

        if (this.dotIdx > 0) {

            this.uncrossCurrentHole();

            this.dotIdx -= 1;
            hasNext = true;

        } else if (this.threadPathIdx > 0) {

            this.unuseCurrentThread();

            this.threadPathIdx -= 1;
            const previousThreadPath = this.pattern.stitch[this.threadPathIdx];

            this.dotIdx = previousThreadPath.length;
            hasNext = true;
        }

        return hasNext;
    }

    private startAnimatingForwardCore(speed: number): void {
        this.timerId = setInterval(() => {

            const hasNext = this.manualNextCore();
            if (!hasNext) {
                this.stopAnimating();

            }
        }, speed);
    }

    private startAnimatingBackwardCore(speed: number): void {
        this.timerId = setInterval(() => {

            const hasNext = this.manualPrevCore();
            if (!hasNext) {
                this.stopAnimating();
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
            length += 1; // add 1 to reflect the given thread

            const dots = threadPath.length;
            length += dots;
        });

        return length;
    }

    private calculatePercentage(percent: number, total: number): number {
        const percentage = (percent / 100) * total;
        return Math.floor(percentage);
    }

    private assertValidState(): void {
        const stitchPattern = this.pattern.stitch;
        const currentThreadPath = stitchPattern[this.threadPathIdx];
        assert.defined(currentThreadPath, "currentThreadPath");
    }
}