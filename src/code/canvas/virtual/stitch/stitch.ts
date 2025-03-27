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

        const threadConfig = config.thread;
        assert.isDefined(threadConfig, "threadConfig");

        this.threadColor = threadConfig.color;
        assert.isDefined(this.threadColor, "threadConfig.color");
        assert.that(this.threadColor.length > 0, "thread color must not be empty");

        this.threadWidth = threadConfig.width;
        assert.isDefined(this.threadWidth, "threadConfig.width");
        assert.that(this.threadWidth > 0, `thread width must be bigger than 0 but it is ${this.threadWidth}`);

        this.minThreadWidth = threadConfig.minWidth;
        assert.isDefined(this.minThreadWidth, "threadConfig.minWidth");
        assert.that(this.minThreadWidth > 0, `min thread width must be bigger than 0 but it is ${this.minThreadWidth}`);

        this.threadWidthZoomStep = threadConfig.widthZoomStep;
        assert.isDefined(this.threadWidthZoomStep, "threadConfig.widthZoomStep");
        assert.that(this.threadWidthZoomStep > 0, `thread width zoom stem must be bigger than 0 but it is ${this.threadWidthZoomStep}`);

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

            // 3. set visibility to false by default, if visible then true will be set later
            this.threads.setVisibilities(index, false);

            // 4. filter by canvas side, back threads won't be drawn
            const side = sides[index];
            if (side === CanvasSide.Back) {
                continue;
            }

            // 5. filter by visibility, if a thread is not into the visible bounds then it won't be drawn
            const fromDotXIdx = fromDotsXIndexes[index];
            const toDotXIdx = toDotsXIndexes[index];
            const fromDotYIdx = fromDotsYIndexes[index];
            const toDotYIdx = toDotsYIndexes[index];

            if ((fromDotXIdx < leftTopIdx.dotX) && (toDotXIdx < leftTopIdx.dotX)) {
                // filter out
                continue;
            }

            if ((fromDotXIdx > rightTopIdx.dotX) && (toDotXIdx > rightTopIdx.dotX)) {
                // filter out
                continue;
            }

            if ((fromDotYIdx < leftTopIdx.dotY) && (toDotYIdx < leftTopIdx.dotY)) {
                // filter out
                continue;
            }

            if ((fromDotYIdx > leftBottomIdx.dotY) && (toDotYIdx > leftBottomIdx.dotY)) {
                // filter out
                continue;
            }

            // 6. thread is visible and must be drawn, make calculations
            const fromDotXPos = this.calculateDotXPosition(fromDotXIdx);
            const fromDotYPos = this.calculateDotYPosition(fromDotYIdx);
            const toDotXPos = this.calculateDotXPosition(toDotXIdx);
            const toDotYPos = this.calculateDotYPosition(toDotYIdx);

            const zoomedThreadWidth = this.calculateZoomedThreadWidth(widths[index]);

            // 7. set the updated pros before drawing
            this.threads.setThread(index, true, fromDotXPos, fromDotYPos, toDotXPos, toDotYPos, zoomedThreadWidth);
        }

        // 8. draw threads, each thread consist of one thread and two dots
        super.invokeDrawThreads(this.threads, density);
    }

    private startListening(): void {
        const pointerUpUn = this.inputCanvas.onPointerUp(this.handlePointerUp.bind(this));
        super.registerUn(pointerUpUn);

        const undoUn = this.inputCanvas.onUndo(this.handleUndo.bind(this));
        super.registerUn(undoUn);
    }

    private handlePointerUp(event: PointerUpEvent): void {
        const position = event.position;
        const inBounds = this.inBounds(position);

        if (inBounds) {
            this.clickDot(position);
        }
    }

    private handleUndo(): void {
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
}