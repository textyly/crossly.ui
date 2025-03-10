import { DotIndex } from "../types.js";
import { StitchCanvasBase } from "./base.js";
import { DotsUtility } from "../../utilities/dots.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { Dot, CanvasSide, CanvasConfig, StitchTread } from "../../types.js";
import { StitchThreadArray } from "../../utilities/arrays/thread/stitch.js";
import { IInputCanvas, PointerUpEvent, Position } from "../../input/types.js";

export class StitchCanvas extends StitchCanvasBase {
    private readonly dotsUtility: DotsUtility<Dot>;
    private readonly threads: StitchThreadArray;

    private clickedDotIndex?: DotIndex;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);

        this.dotsUtility = new DotsUtility();
        this.threads = new StitchThreadArray();

        this.startListening();
    }

    public override dispose(): void {
        // TODO: ARRAYS!!!
        super.dispose();
    }

    protected override redraw(): void {
        // CPU, GPU, memory and GC intensive code
        // Do not extract this method in multiple methods
        // Do not create types/classes for dot and thread (objects are extremely slow and memory/GC consuming)

        // 1. make initial calculations and create new constants for nested props
        const boundsIndexes = this.calculateBoundsIndexes();

        const leftTopIdx = boundsIndexes.leftTop;
        const rightTopIdx = boundsIndexes.rightTop;
        const leftBottomIdx = boundsIndexes.leftBottom;

        const width = this.threadWidth; // TODO: get from threads array 
        const color = this.threadColor; // TODO: get from threads array
        const fromDotsXIdx = this.threads.fromDotsXIdx;
        const toDotsXIdx = this.threads.toDotsXIdx;
        const fromDotsYIdx = this.threads.fromDotsYIdx;
        const toDotsYIdx = this.threads.toDotsYIdx;
        const sides = this.threads.sides;

        const dotRadius = this.dotRadius; // TODO: get from threads array
        const dotColor = this.dotColor;
        const dots = new DotArray(); // TODO: get from threads array

        for (let index = 0; index < this.threads.length; index++) {

            // 2. set visibility to false by default, if visible then true will be set later
            this.threads.setVisibilities(index, false);

            // 3. filter by canvas side, back threads won't be drawn
            const side = sides[index];
            if (side === CanvasSide.Back) {
                continue;
            }

            // 4. filter by visibility, if a thread is not into the visible bounds then it won't be drawn
            const fromDotXIdx = fromDotsXIdx[index];
            const toDotXIdx = toDotsXIdx[index];
            const fromDotYIdx = fromDotsYIdx[index];
            const toDotYIdx = toDotsYIdx[index];

            if ((fromDotXIdx < leftTopIdx.dotX) && (toDotXIdx < leftTopIdx.dotX)) {
                continue;
            }

            if ((fromDotXIdx > rightTopIdx.dotX) && (toDotXIdx > rightTopIdx.dotX)) {
                continue;
            }

            if ((fromDotYIdx < leftTopIdx.dotY) && (toDotYIdx < leftTopIdx.dotY)) {
                continue;
            }

            if ((fromDotYIdx > leftBottomIdx.dotY) && (toDotYIdx > leftBottomIdx.dotY)) {
                continue;
            }

            // 5. thread is visible and must be drawn, make calculations
            const fromDotXPos = this.calculateDotXPosition(fromDotXIdx);
            const fromDotYPos = this.calculateDotYPosition(fromDotYIdx);
            dots.push(fromDotXPos, fromDotYPos, dotRadius, dotColor);

            const toDotXPos = this.calculateDotXPosition(toDotXIdx);
            const toDotYPos = this.calculateDotYPosition(toDotYIdx);
            dots.push(toDotXPos, toDotYPos, dotRadius, dotColor);

            // 6. set the updated pros before drawing
            this.threads.setThread(index, true, fromDotXIdx, fromDotXPos, fromDotYIdx, fromDotYPos, toDotXIdx, toDotXPos, toDotYIdx, toDotYPos, width, color, side);
        }

        // 7. draw threads, each thread consist of one thread and two dots
        super.invokeDrawThreads(this.threads);
        super.invokeDrawDots(dots);
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
        const clickedDotIdx = this.calculateDotIndex(position);
        const previouslyClickedDotIdx = this.clickedDotIndex;

        if (previouslyClickedDotIdx) {
            this.tryDrawThread(clickedDotIdx, previouslyClickedDotIdx);
        }

        this.clickedDotIndex = clickedDotIdx;
        this.changeSide(); // TODO: bug!!! cannot change side on every click. If dots Identical then do not change sides!!! See cue impl
    }

    private tryDrawThread(clickedDotIdx: DotIndex, previouslyClickedDotIdx: DotIndex): void {
        const clickedDotPos = this.calculateDotPosition(clickedDotIdx);
        const previouslyClickedDotPos = this.calculateDotPosition(previouslyClickedDotIdx);

        const areClicksIdentical = this.dotsUtility.areDotsEqual(clickedDotPos, previouslyClickedDotPos);
        if (!areClicksIdentical) {
            const visible = this.currentSide === CanvasSide.Front;

            const thread = this.createThread(previouslyClickedDotIdx, previouslyClickedDotPos, clickedDotIdx, clickedDotPos, visible);
            this.threads.pushThread(thread);

            if (visible) {
                this.drawThread(thread);
            }
        }
    }

    private drawThread(thread: StitchTread): void {
        // draw thread
        const threads = new StitchThreadArray();
        threads.pushThread(thread);
        super.invokeDrawThreads(threads);

        // draw dots
        const dots = new DotArray();
        dots.push(thread.fromDotXPos, thread.fromDotYPos, this.dotRadius, this.dotColor);
        dots.push(thread.toDotXPos, thread.toDotYPos, this.dotRadius, this.dotColor);
        super.invokeDrawDots(dots);
    }

    private createThread(clickedDotIdx: DotIndex, clickedDotPos: Position, previouslyClickedDotIdx: DotIndex, previouslyClickedDotPos: Position, visible: boolean): StitchTread {
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
            color: this.threadColor,
            side: this.currentSide
        };

        return thread;
    }
}