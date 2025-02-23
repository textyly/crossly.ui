import { DotIndex } from "../types.js";
import { StitchCanvasBase } from "./base.js";
import { DotsUtility } from "../../../utilities/dots.js";
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

        // setTimeout(() => {
        //     for (let dotIndexY = 0; dotIndexY < this.allDotsY; dotIndexY += 2) {
        //         for (let dotIndexX = 0; dotIndexX < this.allDotsX; dotIndexX += 2) {
        //             if (dotIndexY > 0 && dotIndexX > 0) {
        //                 this.visible.push(true);
        //                 this.sides.push(CanvasSide.Front);
        //                 this.widths.push(this.threadWidth);
        //                 this.colors.push(this.threadColor);

        //                 this.fromDotsX.push(dotIndexX);
        //                 this.fromDotsY.push(dotIndexY);

        //                 this.toDotsX.push(dotIndexX + 2);
        //                 this.toDotsY.push(dotIndexY - 2);

        //                 this.visible.push(true);
        //                 this.sides.push(CanvasSide.Front);
        //                 this.widths.push(this.threadWidth);
        //                 this.colors.push(this.threadColor);

        //                 this.fromDotsX.push(dotIndexX);
        //                 this.fromDotsY.push(dotIndexY);

        //                 this.toDotsX.push(dotIndexX - 2);
        //                 this.toDotsY.push(dotIndexY - 2);
        //             }
        //         }
        //     }

        //     this.draw();
        // }, 1000);

        this.startListening();
    }

    public override dispose(): void {
        // TODO: ARRAYS!!!
        super.dispose();
    }

    protected override redraw(): void {
        // CPU, GPU, memory and GC intensive code
        // Do not extract this method in different methods

        // TODO: extract in the virtual base class
        const visibleWidth = this.calculateVisibleWidth();
        const visibleHeight = this.calculateVisibleHeight();

        const visibleLeftTopIndex = this.calculateVisibleLeftTopDotIndex();
        const visibleLeftTop = super.calculateDot(visibleLeftTopIndex);

        const visibleRightTop = { x: visibleLeftTop.x + visibleWidth, y: visibleLeftTop.y };
        const visibleRightTopIndex = super.calculateDotIndex(visibleRightTop);

        const visibleLeftBottom = { x: visibleLeftTop.x, y: visibleLeftTop.y + visibleHeight };
        const visibleLeftBottomIndex = super.calculateDotIndex(visibleLeftBottom);
        // ---------------------------------------

        const virtualBounds = this.virtualBounds;
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

            if ((fromDotX < visibleLeftTopIndex.indexX) && (toDotX < visibleLeftTopIndex.indexX)) {
                continue;
            }

            if ((fromDotX > visibleRightTopIndex.indexX) && (toDotX > visibleRightTopIndex.indexX)) {
                continue;
            }

            const fromDotY = this.fromDotsY[index];
            const toDotY = this.toDotsY[index];

            if ((fromDotY < visibleLeftTopIndex.indexY) && (toDotY < visibleLeftTopIndex.indexY)) {
                continue;
            }

            if ((fromDotY > visibleLeftBottomIndex.indexY) && (toDotY > visibleLeftBottomIndex.indexY)) {
                continue;
            }

            const fromDotXPos = virtualBounds.left + (fromDotX * this.dotsSpacing);
            this.fromDotsXPos[index] = fromDotXPos;
            dotsX.push(fromDotXPos);

            const fromDotYPos = virtualBounds.top + (fromDotY * this.dotsSpacing);
            this.fromDotsYPos[index] = fromDotYPos;
            dotsY.push(fromDotYPos);

            const toDotXPos = virtualBounds.left + (toDotX * this.dotsSpacing);
            this.toDotsXPos[index] = toDotXPos;
            dotsX.push(toDotXPos);

            const toDotYPos = virtualBounds.top + (toDotY * this.dotsSpacing);
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
        const isInVirtualBounds = super.inVirtualBounds(position);

        if (isInVirtualBounds) {
            this.handleDotClick(position);
        }
    }

    private handleDotClick(position: Position): void {
        const clickedDotIndex = super.calculateDotIndex(position);
        const clickedDot = super.calculateDot(clickedDotIndex);

        const previouslyClickedDotIndex = this.clickedDotIndex;
        if (previouslyClickedDotIndex) {

            const previouslyClickedDot = this.calculateDot(previouslyClickedDotIndex);
            const areIdenticalClicks = this.dotsUtility.areDotsEqual(clickedDot, previouslyClickedDot);

            if (!areIdenticalClicks) {
                const visible = this.currentSide === CanvasSide.Front;

                this.visible.push(visible);
                this.sides.push(this.currentSide);
                this.widths.push(this.threadWidth);
                this.colors.push(this.threadColor);

                this.fromDotsX.push(previouslyClickedDotIndex.indexX);
                this.fromDotsY.push(previouslyClickedDotIndex.indexY);

                this.toDotsX.push(clickedDotIndex.indexX);
                this.toDotsY.push(clickedDotIndex.indexY);

                if (visible) {
                    super.invokeDrawThreads([visible], [previouslyClickedDot.x], [previouslyClickedDot.y], [clickedDot.x], [clickedDot.y], [this.threadWidth], [this.threadColor]);
                    super.invokeDrawDots([previouslyClickedDot.x, clickedDot.x], [previouslyClickedDot.y, clickedDot.y], this.dotRadius, this.threadColor);
                }
            }
        }

        this.clickedDotIndex = clickedDotIndex;
        this.changeSide();
    }
}