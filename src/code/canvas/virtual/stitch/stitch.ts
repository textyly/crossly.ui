import { Density } from "../types.js";
import { StitchCanvasBase } from "./base.js";
import { DotsUtility } from "../../utilities/dots.js";
import { IdGenerator } from "../../utilities/generator.js";
import { StitchCanvasConfig } from "../../../config/types.js";
import { Dot, CanvasSide, StitchTread, DotIndex } from "../../types.js";
import { StitchThreadArray } from "../../utilities/arrays/thread/stitch.js";
import { IInputCanvas, PointerUpEvent, Position } from "../../input/types.js";
import assert from "../../../asserts/assert.js";

export abstract class StitchCanvas extends StitchCanvasBase {
    protected readonly ids: IdGenerator;
    private readonly dotsUtility: DotsUtility<Dot>;
    private readonly threads: StitchThreadArray;

    private readonly minThreadWidth: number;
    private readonly threadWidthZoomStep: number;

    protected threadColor: string;
    protected threadWidth: number;
    protected currentId: number;

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

        this.ids = new IdGenerator();
        this.dotsUtility = new DotsUtility();
        this.threads = new StitchThreadArray();

        this.zooms = 0;
        this.currentId = this.ids.next();

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

        // 1. make initial calculations and create new constants for nested props

        // get bounds indexes
        const boundsIndexes = this.calculateBoundsIndexes();
        const leftTopIdx = boundsIndexes.leftTop;
        const rightTopIdx = boundsIndexes.rightTop;
        const leftBottomIdx = boundsIndexes.leftBottom;

        // get threads props
        const fromDotsXIndexes = this.threads.fromDotsXIndexes;
        const fromDotsYIndexes = this.threads.fromDotsYIndexes;
        const toDotsXIndexes = this.threads.toDotsXIndexes;
        const toDotsYIndexes = this.threads.toDotsYIndexes;
        const widths = this.threads.widths;
        const sides = this.threads.sides;
        const density = this.calculateDensity();

        // 2. recalculate threads
        for (let index = 0; index < this.threads.length; index++) {

            // 3. filter by canvas side, back threads won't be drawn
            const side = sides[index];
            if (side === CanvasSide.Back) {
                continue;
            }

            // 4. filter by visibility, if a thread is not into the visible bounds then it won't be drawn
            const fromDotXIdx = fromDotsXIndexes[index];
            const toDotXIdx = toDotsXIndexes[index];
            const fromDotYIdx = fromDotsYIndexes[index];
            const toDotYIdx = toDotsYIndexes[index];

            if ((fromDotXIdx < leftTopIdx.dotX) && (toDotXIdx < leftTopIdx.dotX)) {
                // filter out
                this.threads.setVisibility(index, false);
                continue;
            }

            if ((fromDotXIdx > rightTopIdx.dotX) && (toDotXIdx > rightTopIdx.dotX)) {
                // filter out
                this.threads.setVisibility(index, false);
                continue;
            }

            if ((fromDotYIdx < leftTopIdx.dotY) && (toDotYIdx < leftTopIdx.dotY)) {
                // filter out
                this.threads.setVisibility(index, false);
                continue;
            }

            if ((fromDotYIdx > leftBottomIdx.dotY) && (toDotYIdx > leftBottomIdx.dotY)) {
                // filter out
                this.threads.setVisibility(index, false);
                continue;
            }

            // 5. thread is visible and must be drawn, make calculations
            const fromDotXPos = this.calculateDotXPosition(fromDotXIdx);
            const fromDotYPos = this.calculateDotYPosition(fromDotYIdx);
            const toDotXPos = this.calculateDotXPosition(toDotXIdx);
            const toDotYPos = this.calculateDotYPosition(toDotYIdx);

            const zoomedThreadWidth = this.calculateZoomedThreadWidth(widths[index]);

            // 6. set the updated pros before drawing
            this.threads.setThread(index, true, fromDotXPos, fromDotYPos, toDotXPos, toDotYPos, zoomedThreadWidth);
        }

        // 8. draw threads, each thread consist of one thread and two dots
        super.invokeDrawThreads(this.threads, density);
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

        const removed = this.threads.popThread();
        if (!removed) {
            this.currentSide = CanvasSide.Back;
            this.clickedDotIdx = undefined;
        } else {
            this.changeCanvasSide();

            this.clickedDotIdx = { dotX: removed.fromDotXIdx, dotY: removed.fromDotYIdx };
            this.threadColor = removed.color;
            this.threadWidth = removed.width;

            this.invokeThreadWidthChange(this.threadWidth);
            this.invokeThreadColorChange(this.threadColor);
        }

        this.draw();
    }

    private clickDot(position: Position): void {
        const previouslyClickedDotIdx = this.clickedDotIdx;
        const clickedDotIdx = this.calculateDotIndex(position);

        if (previouslyClickedDotIdx) {
            this.tryDrawThread(previouslyClickedDotIdx, clickedDotIdx);
        } else {
            this.changeCanvasSide();
        }

        this.clickedDotIdx = clickedDotIdx;
    }

    private tryDrawThread(previouslyClickedDotIdx: DotIndex, clickedDotIdx: DotIndex): void {
        const clickedDotPos = this.calculateDotPosition(clickedDotIdx);
        const previouslyClickedDotPos = this.calculateDotPosition(previouslyClickedDotIdx);

        const areClicksIdentical = this.dotsUtility.areDotsEqual(previouslyClickedDotPos, clickedDotPos);
        if (!areClicksIdentical) {
            const visible = this.currentSide === CanvasSide.Front;

            const thread = this.createThread(this.currentId, previouslyClickedDotIdx, previouslyClickedDotPos, clickedDotIdx, clickedDotPos, visible);
            this.threads.pushThread(thread);

            if (visible) {
                this.drawThread(thread);
            }

            this.changeCanvasSide();
        }
    }

    private drawThread(thread: StitchTread): void {
        // draw thread
        const threads = new StitchThreadArray();
        threads.pushThread(thread);

        const density = this.calculateDensity();
        super.invokeDrawThreads(threads, density);
    }

    private calculateZoomedThreadWidth(threadWidth: number): number {
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

    private createThread(id: number, previouslyClickedDotIdx: DotIndex, previouslyClickedDotPos: Position, clickedDotIdx: DotIndex, clickedDotPos: Position, visible: boolean): StitchTread {
        const thread = {
            id,
            visible,
            fromDotXIdx: previouslyClickedDotIdx.dotX,
            fromDotXPos: previouslyClickedDotPos.x,
            fromDotYIdx: previouslyClickedDotIdx.dotY,
            fromDotYPos: previouslyClickedDotPos.y,
            toDotXIdx: clickedDotIdx.dotX,
            toDotXPos: clickedDotPos.x,
            toDotYIdx: clickedDotIdx.dotY,
            toDotYPos: clickedDotPos.y,
            width: this.threadWidth,
            zoomedWidth: this.calculateZoomedThreadWidth(this.threadWidth),
            color: this.threadColor,
            side: this.currentSide
        };

        return thread;
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