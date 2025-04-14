import { Density } from "../types.js";
import { StitchCanvasBase } from "./base.js";
import assert from "../../../asserts/assert.js";
import { DotsUtility } from "../../utilities/dots.js";
import { StitchCanvasConfig } from "../../../config/types.js";
import { StitchThread } from "../../utilities/arrays/thread/stitch.js";
import { Dot, CanvasSide, DotIndex, StitchPattern } from "../../types.js";
import { IInputCanvas, PointerUpEvent, Position } from "../../input/types.js";

export abstract class StitchCanvas extends StitchCanvasBase {
    private readonly dotsUtility: DotsUtility<Dot>;
    private readonly pattern: StitchPattern;

    private readonly minThreadWidth: number;
    private readonly threadWidthZoomStep: number;

    protected threadColor: string;
    protected threadWidth: number;

    private zooms: number;
    private clickedDotIdx?: DotIndex;


    constructor(config: StitchCanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);

        this.validateConfig(config);

        const threadConfig = config.thread;
        this.threadColor = threadConfig.color;
        this.threadWidth = threadConfig.width;
        this.minThreadWidth = threadConfig.minWidth;
        this.threadWidthZoomStep = threadConfig.widthZoomStep;

        this.dotsUtility = new DotsUtility();

        this.pattern = new Array<StitchThread>();
        this.createThread(this.threadColor, this.threadWidth);

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

    protected createThread(color: string, width: number): void {
        const stitchThread = new StitchThread(color, width);
        this.pattern.push(stitchThread);
    }

    protected cutThread(): void {
        this.clickedDotIdx = undefined;
        this.currentSide = CanvasSide.Back;
    }

    private getCurrentThread(): StitchThread {
        const last = this.pattern.slice(this.pattern.length - 1, this.pattern.length)[0];
        return last;
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

        const currentThread = this.getCurrentThread();
        const removedDot = currentThread.popDot();
        const lastDot = currentThread.last();

        if (!removedDot || !lastDot) {
            this.cutThread();
            this.pattern.pop();

            const thread = this.getCurrentThread();
            if (thread) {
                this.threadColor = thread.color;
                this.threadWidth = thread.width;
            } else {
                const config = this.config as StitchCanvasConfig;
                this.createThread(config.thread.color, config.thread.width);
            }
        } else {
            this.changeCanvasSide();

            this.clickedDotIdx = { dotX: lastDot.dotX, dotY: lastDot.dotY };
            this.threadColor = currentThread.color;
            this.threadWidth = currentThread.width;

            this.invokeThreadWidthChange(this.threadWidth);
            this.invokeThreadColorChange(this.threadColor);
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
            thread.pushDot(clickedDotIdx.dotX, clickedDotIdx.dotY, clickedDotPos.x, clickedDotPos.y, visible);

            if (visible) {
                const zoomedWidth = this.calculateThreadZoomedWidth(this.threadWidth);
                const segment = { from: previouslyClickedDotPos, to: clickedDotPos, color: this.threadColor, width: zoomedWidth };

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
        const halfDotsSpace = Math.ceil(this.dotsSpace / 2);

        if (this.currentDotsSpace <= this.minDotsSpace) {
            return Density.High;
        }

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