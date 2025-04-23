import { Density } from "../types.js";
import { StitchCanvasBase } from "./base.js";
import assert from "../../../asserts/assert.js";
import { DotsUtility } from "../../utilities/dots.js";
import { Dot, CanvasSide, DotIndex } from "../../types.js";
import { StitchCanvasConfig } from "../../../config/types.js";
import { ThreadPath } from "../../utilities/arrays/thread/stitch.js";
import { IInputCanvas, PointerUpEvent, Position } from "../../input/types.js";

export abstract class StitchCanvas extends StitchCanvasBase {
    private readonly dotsUtility: DotsUtility<Dot>;
    private readonly pattern: Array<ThreadPath>;

    private readonly minThreadWidth: number;
    private readonly threadWidthZoomStep: number;

    private zooms: number;
    private clickedDotIdx?: DotIndex;


    constructor(config: StitchCanvasConfig, inputCanvas: IInputCanvas) {
        super(StitchCanvas.name, config, inputCanvas);

        this.validateConfig(config);

        const threadConfig = config.thread;
        this.minThreadWidth = threadConfig.minWidth;
        this.threadWidthZoomStep = threadConfig.widthZoomStep;

        this.pattern = new Array<ThreadPath>();
        this.createThread(threadConfig.color, threadConfig.width);

        this.dotsUtility = new DotsUtility();

        this.zooms = 0;

        this.startListening();
    }

    public override dispose(): void {
        // TODO: ARRAYS!!!
        super.dispose();
    }

    protected override zoomIn(): void {
        this.zooms += 1;
    }

    protected override zoomOut(): void {
        this.zooms -= 1;
    }

    protected override redraw(): void {
        // CPU, GPU, memory and GC intensive code
        // Do not extract this method in multiple methods
        // Do not create types/classes a thread (objects are extremely slow and memory/GC consuming)
        const boundsIndexes = this.calculateVisibleBoundsIndexes();

        const leftTopIdxX = boundsIndexes.leftTop.dotX;
        const leftTopIdxY = boundsIndexes.leftTop.dotY;
        const rightTopIdxX = boundsIndexes.rightTop.dotX;
        const leftBottomIdxY = boundsIndexes.leftBottom.dotY;

        for (let threadIdx = 0; threadIdx < this.pattern.length; threadIdx++) {
            const thread = this.pattern[threadIdx];
            thread.zoomedWidth = this.calculateThreadZoomedWidth(thread.width);

            const indexesX = thread.indexesX;
            const indexesY = thread.indexesY;

            for (let dotIdx = 0; dotIdx < thread.length; dotIdx++) {
                const indexX = indexesX[dotIdx];
                const indexY = indexesY[dotIdx];

                const posX = this.calculateDotXPosition(indexX);
                const posY = this.calculateDotYPosition(indexY);
                thread.setDot(dotIdx, posX, posY, true);

                if (indexX < leftTopIdxX || indexX > rightTopIdxX) {
                    thread.setDotVisibility(dotIdx, false);
                    continue;
                }

                if (indexY < leftTopIdxY || indexY > leftBottomIdxY) {
                    thread.setDotVisibility(dotIdx, false);
                    continue;
                }
            }
        }

        const density = this.calculateDensity();
        super.invokeDrawPattern(this.pattern, density);
    }

    protected useNewThread(color: string, width: number): void {
        this.removeThread();
        this.createThread(color, width);
    }

    protected createThread(color: string, width: number): void {
        const stitchThread = new ThreadPath(color, width);
        this.pattern.push(stitchThread);
    }

    protected removeThread(): void {
        this.clickedDotIdx = undefined;
        this.currentSide = CanvasSide.Back;
    }

    private getCurrentThread(): ThreadPath | undefined {
        const length = this.pattern.length;
        const array = this.pattern.slice(length - 1, length);

        return array.length === 0 ? undefined : array[0];
    }

    private handlePointerUp(event: PointerUpEvent): void {
        super.ensureAlive();

        const position = event.position;
        assert.positive(position.x, "position.x");
        assert.positive(position.y, "position.y");

        const inBounds = this.inBounds(position);
        if (inBounds) {
            this.clickDot(position);
        }
    }

    private handleUndo(): void {
        super.ensureAlive();

        const threadsCount = this.pattern.length;
        assert.greaterThanZero(threadsCount, "threadsCount");

        const currentThread = this.getCurrentThread();
        assert.defined(currentThread, "currentThread");

        this.handleUndoCore(threadsCount, currentThread);
    }

    private handleUndoCore(threadsCount: number, currentThread: ThreadPath): void {
        const dotsCount = currentThread.length;
        if (dotsCount === 0) {
            // thread is just created without crossing any hole (state immediately following `use new thread` operation)
            if (threadsCount === 1) {
                // there is only 1 thread which has not crossed any hole
                // cannot undo any more
            } else {
                // remove current thread
                this.pattern.pop();
                super.invokeChange(this.pattern);

                const previousThread = this.getCurrentThread();
                assert.defined(previousThread, "previousThread");

                const previousThreadDotsCount = previousThread.length;
                if (previousThreadDotsCount === 0) {
                    // previous thread have not crossed any dots as well, just remove it
                } else {
                    this.currentSide = previousThreadDotsCount % 2 === 0 ? CanvasSide.Back : CanvasSide.Front;
                    this.clickedDotIdx = previousThread.lastDot()!;
                }
            }
        } else {
            // thread has crossed at leas one hole
            if (dotsCount === 1) {
                // remove last dot
                currentThread.pop();
                this.removeThread();
            } else {
                // remove last dot
                currentThread.pop();
                this.changeCanvasSide();
                this.clickedDotIdx = currentThread.lastDot()!;
            }
            super.invokeChange(this.pattern);
        }

        this.draw();
    }

    private clickDot(position: Position): void {
        const previouslyClickedDotIdx = this.clickedDotIdx;
        const clickedDotIdx = this.calculateDotIndex(position);

        if (previouslyClickedDotIdx) {
            this.tryDrawStitchSegment(previouslyClickedDotIdx, clickedDotIdx);
        } else {
            const clickedDotPos = this.calculateDotPosition(clickedDotIdx);

            const thread = this.getCurrentThread();
            assert.defined(thread, "thread");

            thread.pushDot(clickedDotIdx.dotX, clickedDotIdx.dotY, clickedDotPos.x, clickedDotPos.y, true);

            this.changeCanvasSide();
        }

        this.clickedDotIdx = clickedDotIdx;
    }

    private tryDrawStitchSegment(previouslyClickedDotIdx: DotIndex, clickedDotIdx: DotIndex): void {
        const clickedDotPos = this.calculateDotPosition(clickedDotIdx);
        const previouslyClickedDotPos = this.calculateDotPosition(previouslyClickedDotIdx);

        const areClicksIdentical = this.dotsUtility.areDotsEqual(previouslyClickedDotPos, clickedDotPos);
        if (!areClicksIdentical) {
            const visible = this.currentSide === CanvasSide.Front;

            const thread = this.getCurrentThread();
            assert.defined(thread, "thread");

            thread.pushDot(clickedDotIdx.dotX, clickedDotIdx.dotY, clickedDotPos.x, clickedDotPos.y, visible);
            super.invokeChange(this.pattern);

            if (visible) {
                const zoomedWidth = this.calculateThreadZoomedWidth(thread.width);
                const segment = { from: previouslyClickedDotPos, to: clickedDotPos, color: thread.color, width: zoomedWidth };

                const density = this.calculateDensity();
                super.invokeDrawSegment(segment, density);
            }

            this.changeCanvasSide();
        }
    }

    private calculateThreadZoomedWidth(threadWidth: number): number {
        let calculated = threadWidth + (this.zooms * this.threadWidthZoomStep);
        calculated = Math.max(calculated, this.minThreadWidth);
        return calculated;
    }

    private calculateDensity(): Density {
        if (this.currentDotsSpace <= this.minDotsSpace) {
            return Density.High;
        }

        const halfDotsSpace = Math.ceil(this.dotsSpace / 2);

        if (this.currentDotsSpace <= halfDotsSpace) {
            return Density.Medium;
        }

        return Density.Low;
    }

    private startListening(): void {
        const pointerUpUn = this.inputCanvas.onPointerUp(this.handlePointerUp.bind(this));
        super.registerUn(pointerUpUn);

        const undoUn = this.inputCanvas.onUndo(this.handleUndo.bind(this));
        super.registerUn(undoUn);
    }

    private validateConfig(config: StitchCanvasConfig): void {
        const threadConfig = config.thread;
        assert.defined(threadConfig, "ThreadConfig");

        assert.greaterThanZero(threadConfig.color.length, "color.length");
        assert.greaterThanZero(threadConfig.width, "width");
        assert.greaterThanZero(threadConfig.minWidth, "minWidth");
        assert.greaterThanZero(threadConfig.widthZoomStep, "widthZoomStep");
    }
}