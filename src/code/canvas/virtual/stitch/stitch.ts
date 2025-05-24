import { Density } from "../types.js";
import { StitchCanvasBase } from "./base.js";
import assert from "../../../asserts/assert.js";
import { DotsUtility } from "../../utilities/dots.js";
import { Dot, CanvasSide, DotIndex, } from "../../types.js";
import { StitchCanvasConfig } from "../../../config/types.js";
import patternCloning from "../../utilities/arrays/cloning.js";
import { IStitchThreadPath } from "../../utilities/arrays/types.js";
import { StitchThreadPath } from "../../utilities/arrays/thread/stitch.js";
import { IInputCanvas, PointerUpEvent, Position } from "../../input/types.js";

// TODO: there is common logic between CueCanvas and StitchCanvas, and therefore:
// 1. when features are added code must be duplicated with some small differences
// 2. bug fixes must be present in both classes
// Common logic must be extracted in a base class
// This can be done once a good amount of unit/integration tests are written
export abstract class StitchCanvas extends StitchCanvasBase {
    private readonly dotsUtility: DotsUtility<Dot>;
    protected _pattern: Array<StitchThreadPath>;
    protected _redoPattern: Array<IStitchThreadPath> | undefined;

    private readonly minThreadWidth: number;
    private readonly threadWidthZoomStep: number;

    private zooms: number;
    protected clickedDotIdx?: DotIndex;

    constructor(config: StitchCanvasConfig, inputCanvas: IInputCanvas) {
        super(StitchCanvas.name, config, inputCanvas);

        this.validateConfig(config);

        const threadConfig = config.threads;
        this.minThreadWidth = threadConfig.minWidth;
        this.threadWidthZoomStep = threadConfig.widthZoomStep;

        this._pattern = new Array<StitchThreadPath>();
        this.createThread(threadConfig.name, threadConfig.color, threadConfig.width);

        this.dotsUtility = new DotsUtility();

        this.zooms = 0;

        this.startListening();
    }

    public override dispose(): void {
        super.ensureAlive();

        this._pattern.forEach((threadPath) => threadPath.clear());
        this._pattern = [];

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

        for (let threadIdx = 0; threadIdx < this._pattern.length; threadIdx++) {
            const thread = this._pattern[threadIdx];
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
        super.invokeDrawPattern(this._pattern, density);
    }

    protected useNewThread(name: string, color: string, width: number): void {
        this.clickedDotIdx = undefined;
        this.currentSide = CanvasSide.Back;
        this.createThread(name, color, width);
    }

    protected createThread(name: string, color: string, width: number): void {
        const stitchThread = new StitchThreadPath(name, color, width);
        this._pattern.push(stitchThread);
    }

    protected getCurrentThread(): StitchThreadPath {
        const length = this._pattern.length;
        const array = this._pattern.slice(length - 1, length);

        const thread = array.length === 0 ? undefined : array[0];
        assert.defined(thread, "thread");

        return thread;
    }

    protected undoClickDot(): void {
        const threadsCount = this._pattern.length;
        assert.greaterThanZero(threadsCount, "threadsCount");

        const currentThread = this.getCurrentThread();
        assert.defined(currentThread, "currentThread");

        this.undoClickDotCore();

        this.draw();
        super.invokeChange(this._pattern);
    }

    protected redoClickDot(): void {
        const threadsCount = this._pattern.length;
        assert.greaterThanZero(threadsCount, "threadsCount");

        const currentThread = this.getCurrentThread();
        assert.defined(currentThread, "currentThread");

        if (this._redoPattern) {
            const errorMsg = "redo pattern cannot have less thread paths than the current one (on which undo operations have been performed)";
            assert.that(this._pattern.length <= this._redoPattern.length, errorMsg);

            this.redoClickDotCore(this._pattern, this._redoPattern);

            this.draw();
            super.invokeChange(this._pattern);
        }
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
        this.undoClickDot();
    }

    private undoClickDotCore(): void {
        const currentThread = this.getCurrentThread();
        this._redoPattern = this._redoPattern ?? patternCloning.cloneStitchPattern(this._pattern);

        const currentThreadDots = currentThread.length;
        if (currentThreadDots > 0) {
            if (currentThreadDots === 1) {
                // remove last dot
                currentThread.popDot()!;
                this.clickedDotIdx = undefined;
                this.currentSide = CanvasSide.Back;
            } else {
                // remove last dot
                currentThread.popDot()!;
                this.clickedDotIdx = currentThread.lastDot()!;
                this.changeCanvasSide();
            }
        } else {
            const threads = this._pattern.length;
            if (threads > 1) {
                // remove current thread
                this._pattern.pop()!;
                const previousThread = this.getCurrentThread();
                if (previousThread.length > 0) {
                    this.clickedDotIdx = previousThread.lastDot()!;
                    this.currentSide = previousThread.length % 2 === 0 ? CanvasSide.Back : CanvasSide.Front;
                }
            }
        }
    }

    private redoClickDotCore(currentPattern: Array<StitchThreadPath>, redoPattern: Array<IStitchThreadPath>): void {
        const currentThreadPathIndex = currentPattern.length - 1;
        const redoThreadPath = redoPattern[currentThreadPathIndex];
        const currentThreadPath = currentPattern[currentThreadPathIndex];

        if (redoThreadPath.length > currentThreadPath.length) {
            const redoDotIndex = currentThreadPath.length;
            const indexX = redoThreadPath.indexesX[redoDotIndex];
            const indexY = redoThreadPath.indexesY[redoDotIndex];
            currentThreadPath.pushDotIndex(indexX, indexY);

            this.clickedDotIdx = { dotX: indexX, dotY: indexY };
            this.changeCanvasSide();

        } else if (redoPattern.length > currentPattern.length) {
            const nextRedoThreadPath = redoPattern[currentPattern.length];
            const newCurrentThreadPath = new StitchThreadPath(nextRedoThreadPath.name, nextRedoThreadPath.color, nextRedoThreadPath.width);
            currentPattern.push(newCurrentThreadPath);

            this.clickedDotIdx = undefined;
            this.currentSide = CanvasSide.Back;
        }
    }

    private clickDot(position: Position): void {
        const previouslyClickedDotIdx = this.clickedDotIdx;
        const clickedDotIdx = this.calculateDotIndex(position);

        if (previouslyClickedDotIdx) {
            this.tryDrawStitchSegment(previouslyClickedDotIdx, clickedDotIdx);
        } else {
            const clickedDotPos = this.calculateDotPosition(clickedDotIdx);

            // TODO: use common method with tryDrawStitchSegment
            const thread = this.getCurrentThread();
            thread.pushDot(clickedDotIdx.dotX, clickedDotIdx.dotY, clickedDotPos.x, clickedDotPos.y, true);
            this._redoPattern = undefined;
            super.invokeChange(this._pattern);
            // till here

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

            // TODO: use common method with clickDot
            const thread = this.getCurrentThread();
            thread.pushDot(clickedDotIdx.dotX, clickedDotIdx.dotY, clickedDotPos.x, clickedDotPos.y, visible);
            this._redoPattern = undefined;
            super.invokeChange(this._pattern);
            // till here

            const zoomedWidth = this.calculateThreadZoomedWidth(thread.width);
            const segment = { from: previouslyClickedDotPos, to: clickedDotPos, color: thread.color, width: zoomedWidth, side: this.currentSide };

            const density = this.calculateDensity();
            super.invokeDrawSegment(segment, density);

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
        const threadConfig = config.threads;
        assert.greaterThanZero(threadConfig.color.length, "color.length");
        assert.greaterThanZero(threadConfig.width, "width");
        assert.greaterThanZero(threadConfig.minWidth, "minWidth");
        assert.greaterThanZero(threadConfig.widthZoomStep, "widthZoomStep");
    }
}