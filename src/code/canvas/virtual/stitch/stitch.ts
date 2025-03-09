import { DotIndex } from "../types.js";
import { StitchCanvasBase } from "./base.js";
import { DotsUtility } from "../../utilities/dots.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { Dot, CanvasSide, CanvasConfig } from "../../types.js";
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
            let visibility = false;
            this.threads.setVisibility(index, visibility);

            const side = sides[index];
            if (side === CanvasSide.Back) {
                continue;
            }

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

            const fromDotXPos = this.calculateDotX(fromDotXIdx);
            const fromDotYPos = this.calculateDotY(fromDotYIdx);
            dots.push(fromDotXPos, fromDotYPos, dotRadius, dotColor);

            const toDotXPos = this.calculateDotX(toDotXIdx);
            const toDotYPos = this.calculateDotY(toDotYIdx);
            dots.push(toDotXPos, toDotYPos, dotRadius, dotColor);

            visibility = true;
            this.threads.setThread(index, visibility, fromDotXIdx, fromDotXPos, fromDotYIdx, fromDotYPos, toDotXIdx, toDotXPos, toDotYIdx, toDotYPos, width, color, side);
        }

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
            this.handleDotClick(position);
        }
    }

    private handleDotClick(position: Position): void {
        const clickedDotIdx = this.calculateDotIndex(position);
        const clickedDotPos = this.calculateDotPosition(clickedDotIdx);

        const previouslyClickedDotIdx = this.clickedDotIndex;
        if (previouslyClickedDotIdx) {

            const previouslyClickedDotPos = this.calculateDotPosition(previouslyClickedDotIdx);
            const areIdenticalClicks = this.dotsUtility.areDotsEqual(clickedDotPos, previouslyClickedDotPos);

            if (!areIdenticalClicks) {
                const visibility = this.currentSide === CanvasSide.Front;

                // TODO: create a thread and push it in both collections (add such method in the array)
                this.threads.pushThread(
                    visibility,
                    previouslyClickedDotIdx.dotX,
                    previouslyClickedDotPos.x,
                    previouslyClickedDotIdx.dotY,
                    previouslyClickedDotPos.y,
                    clickedDotIdx.dotX,
                    clickedDotPos.x,
                    clickedDotIdx.dotY,
                    clickedDotPos.y,
                    this.threadWidth,
                    this.threadColor,
                    this.currentSide
                );

                if (visibility) {
                    const threads = new StitchThreadArray();
                    threads.pushThread(
                        visibility,
                        previouslyClickedDotIdx.dotX,
                        previouslyClickedDotPos.x,
                        previouslyClickedDotIdx.dotY,
                        previouslyClickedDotPos.y,
                        clickedDotIdx.dotX,
                        clickedDotPos.x,
                        clickedDotIdx.dotY,
                        clickedDotPos.y,
                        this.threadWidth,
                        this.threadColor,
                        this.currentSide
                    );
                    super.invokeDrawThreads(threads);

                    const dots = new DotArray();
                    dots.push(previouslyClickedDotPos.x, previouslyClickedDotPos.y, this.dotRadius, this.dotColor);
                    dots.push(clickedDotPos.x, clickedDotPos.y, this.dotRadius, this.dotColor);
                    super.invokeDrawDots(dots);
                }
            }
        }

        this.clickedDotIndex = clickedDotIdx;
        this.changeSide(); // TODO: bug!!! cannot change side on every click. If dots Identical then do not change sides!!! See cue impl
    }
}