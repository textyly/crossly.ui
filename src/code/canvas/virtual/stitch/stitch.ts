import { DotIndex } from "../types.js";
import { StitchCanvasBase } from "./base.js";
import { DotsUtility } from "../../utilities/dots.js";
import { Dot, CanvasSide, CanvasConfig } from "../../types.js";
import { IInputCanvas, PointerUpEvent, Position } from "../../input/types.js";

export class StitchCanvas extends StitchCanvasBase {
    private readonly dotsUtility: DotsUtility<Dot>;

    private visible: Array<boolean>;
    private fromDotsX: Array<number>;
    private fromDotsXPos: Array<number>;
    private fromDotsY: Array<number>;
    private fromDotsYPos: Array<number>;
    private toDotsX: Array<number>;
    private toDotsXPos: Array<number>;
    private toDotsY: Array<number>;
    private toDotsYPos: Array<number>;
    private widths: Array<number>;
    private sides: Array<CanvasSide>;
    private colors: Array<string>;


    private clickedDotIndex?: DotIndex;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);

        this.dotsUtility = new DotsUtility();

        this.visible = Array<boolean>();
        this.fromDotsX = new Array<number>();
        this.fromDotsXPos = new Array<number>();
        this.fromDotsY = new Array<number>();
        this.fromDotsYPos = new Array<number>();
        this.toDotsX = new Array<number>();
        this.toDotsXPos = new Array<number>();
        this.toDotsY = new Array<number>();
        this.toDotsYPos = new Array<number>();
        this.widths = new Array<number>();
        this.sides = new Array<CanvasSide>();
        this.colors = new Array<string>();

        this.startListening();
    }

    public override dispose(): void {
        // TODO: ARRAYS!!!
        super.dispose();
    }

    protected override redraw(): void {
        // CPU, GPU, memory and GC intensive code
        // Do not extract this method in different methods
        const boundsIndexes = this.calculateBoundsIndexes();

        const leftTopIndex = boundsIndexes.leftTop;
        const rightTopIndex = boundsIndexes.rightTop;
        const leftBottomIndex = boundsIndexes.leftBottom;

        const threadWidth = this.threadWidth;
        const threadColor = this.threadColor;

        const dotRadius = this.dotRadius;
        const dotsX = new Array<number>();
        const dotsY = new Array<number>();

        for (let index = 0; index < this.fromDotsX.length; index++) {
            this.visible[index] = false;

            const side = this.sides[index];
            if (side === CanvasSide.Back) {
                continue;
            }

            const fromDotX = this.fromDotsX[index];
            const toDotX = this.toDotsX[index];

            if ((fromDotX < leftTopIndex.dotX) && (toDotX < leftTopIndex.dotX)) {
                continue;
            }

            if ((fromDotX > rightTopIndex.dotX) && (toDotX > rightTopIndex.dotX)) {
                continue;
            }

            const fromDotY = this.fromDotsY[index];
            const toDotY = this.toDotsY[index];

            if ((fromDotY < leftTopIndex.dotY) && (toDotY < leftTopIndex.dotY)) {
                continue;
            }

            if ((fromDotY > leftBottomIndex.dotY) && (toDotY > leftBottomIndex.dotY)) {
                continue;
            }


            const fromDotXPos = this.calculateDotX(fromDotX);
            this.fromDotsXPos[index] = fromDotXPos;
            dotsX.push(fromDotXPos);

            const fromDotYPos = this.calculateDotY(fromDotY);
            this.fromDotsYPos[index] = fromDotYPos;
            dotsY.push(fromDotYPos);

            const toDotXPos = this.calculateDotX(toDotX);
            this.toDotsXPos[index] = toDotXPos;
            dotsX.push(toDotXPos);

            const toDotYPos = this.calculateDotY(toDotY);
            this.toDotsYPos[index] = toDotYPos;
            dotsY.push(toDotYPos);

            this.widths[index] = threadWidth;

            this.visible[index] = true;
        }

        super.invokeDrawThreads(this.visible, this.fromDotsXPos, this.fromDotsYPos, this.toDotsXPos, this.toDotsYPos, this.widths, this.colors);
        super.invokeDrawDots(dotsX, dotsY, dotRadius, threadColor);
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

        const previouslyClickedDotIndex = this.clickedDotIndex;
        if (previouslyClickedDotIndex) {

            const previouslyClickedDotPos = this.calculateDotPosition(previouslyClickedDotIndex);
            const areIdenticalClicks = this.dotsUtility.areDotsEqual(clickedDotPos, previouslyClickedDotPos);

            if (!areIdenticalClicks) {
                const visible = this.currentSide === CanvasSide.Front;

                this.visible.push(visible);
                this.sides.push(this.currentSide);
                this.widths.push(this.threadWidth);
                this.colors.push(this.threadColor);

                this.fromDotsX.push(previouslyClickedDotIndex.dotX);
                this.fromDotsY.push(previouslyClickedDotIndex.dotY);

                this.toDotsX.push(clickedDotIdx.dotX);
                this.toDotsY.push(clickedDotIdx.dotY);

                if (visible) {
                    super.invokeDrawThreads([visible], [previouslyClickedDotPos.x], [previouslyClickedDotPos.y], [clickedDotPos.x], [clickedDotPos.y], [this.threadWidth], [this.threadColor]);
                    super.invokeDrawDots([previouslyClickedDotPos.x, clickedDotPos.x], [previouslyClickedDotPos.y, clickedDotPos.y], this.dotRadius, this.threadColor);
                }
            }
        }

        this.clickedDotIndex = clickedDotIdx;
        this.changeSide(); // TODO: bug!!! cannot change side on every click. If dots Identical then do not change sides!!! See cue impl
    }
}