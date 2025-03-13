import { StitchCanvasBase } from "./base.js";
import { DotsUtility } from "../../utilities/dots.js";
import { StitchThreadArray } from "../../utilities/arrays/thread/stitch.js";
import { IInputCanvas, PointerUpEvent, Position } from "../../input/types.js";
import { Dot, CanvasSide, StitchTread, DotIndex, StitchCanvasConfig } from "../../types.js";

export abstract class StitchCanvas extends StitchCanvasBase {
    private readonly dotsUtility: DotsUtility<Dot>;
    private readonly threads: StitchThreadArray;

    protected threadWidth: number;
    protected threadColor: string;
    private threadWidthZoomStep: number;
    private zooms: number;

    private clickedDotIdx?: DotIndex;

    constructor(config: StitchCanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);

        this.dotsUtility = new DotsUtility();
        this.threads = new StitchThreadArray();

        const threadConfig = config.thread;
        this.threadColor = threadConfig.color;
        this.threadWidth = threadConfig.width;
        this.threadWidthZoomStep = threadConfig.widthZoomStep;
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
        const zoomWidths = this.threads.zoomWidths;
        const sides = this.threads.sides;

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

            const zoomedWidth = widths[index] + (this.zooms * zoomWidths[index]);

            // 7. set the updated pros before drawing
            this.threads.setThread(index, true, fromDotXPos, fromDotYPos, toDotXPos, toDotYPos, zoomedWidth);
        }

        // 8. draw threads, each thread consist of one thread and two dots
        super.invokeDrawThreads(this.threads);
    }

    private startListening(): void {
        const pointerUpUn = this.inputCanvas.onPointerUp(this.handlePointerUp.bind(this));
        super.registerUn(pointerUpUn);
    }

    private handlePointerUp(event: PointerUpEvent): void {
        const position = event.position;
        const inVirtualBounds = this.inVirtualBounds(position);

        if (inVirtualBounds) {
            this.clickDot(position);
        }
    }

    private clickDot(position: Position): void {
        const previouslyClickedDotIdx = this.clickedDotIdx;
        const clickedDotIdx = this.calculateDotIndex(position);

        if (previouslyClickedDotIdx) {
            this.tryDrawThread(previouslyClickedDotIdx, clickedDotIdx);
        } else {
            this.changeSide();
        }

        this.clickedDotIdx = clickedDotIdx;
    }

    private tryDrawThread(previouslyClickedDotIdx: DotIndex, clickedDotIdx: DotIndex): void {
        const clickedDotPos = this.calculateDotPosition(clickedDotIdx);
        const previouslyClickedDotPos = this.calculateDotPosition(previouslyClickedDotIdx);

        const areClicksIdentical = this.dotsUtility.areDotsEqual(previouslyClickedDotPos, clickedDotPos);
        if (!areClicksIdentical) {
            const visible = this.currentSide === CanvasSide.Front;

            const thread = this.createThread(previouslyClickedDotIdx, previouslyClickedDotPos, clickedDotIdx, clickedDotPos, visible);
            this.threads.pushThread(thread);

            if (visible) {
                this.drawThread(thread);
            }

            this.changeSide();
        }
    }

    private drawThread(thread: StitchTread): void {
        // draw thread
        const threads = new StitchThreadArray();
        threads.pushThread(thread);
        super.invokeDrawThreads(threads);
    }

    private createThread(previouslyClickedDotIdx: DotIndex, previouslyClickedDotPos: Position, clickedDotIdx: DotIndex, clickedDotPos: Position, visible: boolean): StitchTread {
        const thread = {
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
            zoomWidth: this.threadWidthZoomStep,
            zoomedWidth: this.threadWidth + (this.zooms * this.threadWidthZoomStep),
            color: this.threadColor,
            side: this.currentSide
        };

        return thread;
    }
}