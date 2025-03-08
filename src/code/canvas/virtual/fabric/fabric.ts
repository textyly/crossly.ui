import { FabricCanvasBase } from "./base.js";
import { CanvasConfig } from "../../types.js";
import { IInputCanvas } from "../../input/types.js";

export class FabricCanvas extends FabricCanvasBase {
    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);
    }

    protected override redraw(): void {
        const drawingBounds = this.inMovingMode ? this._movingBounds! : this.visibleBounds;
        const boundsIndexes = this.calculateDrawingBoundsIndexes(this.virtualBounds, drawingBounds, this.dotsSpacing);
        const leftTopIndex = boundsIndexes.leftTop;

        const leftTopIndexX = leftTopIndex.indexX;
        const startIndexX = leftTopIndexX % 2 === 0 ? leftTopIndexX : leftTopIndexX + 1;

        const leftTopIndexY = leftTopIndex.indexY;
        const startIndexY = leftTopIndexY % 2 === 0 ? leftTopIndexY : leftTopIndexY + 1;

        const endIndexX = boundsIndexes.rightTop.indexX;
        const endIndexY = boundsIndexes.leftBottom.indexY;

        this.createThreads(startIndexX, startIndexY, endIndexX, endIndexY);
        this.createDots(startIndexX, startIndexY, endIndexX, endIndexY);
    }

    private createDots(startIndexX: number, startIndexY: number, endIndexX: number, endIndexY: number): void {
        // CPU, GPU, memory and GC intensive code
        // Do not extract this method in different methods

        const virtualBounds = this.virtualBounds;
        const dotsSpacing = this.dotsSpacing;
        const dotsX = new Array<number>();
        const dotsY = new Array<number>();

        for (let dotY = startIndexY; dotY <= endIndexY; dotY += 2) {
            for (let dotX = startIndexX; dotX <= endIndexX; dotX += 2) {

                const dotIndex = { indexX: dotX, indexY: dotY };
                const dot = this.calculateDrawingPosition(virtualBounds, dotIndex, dotsSpacing);
                dotsX.push(dot.x);
                dotsY.push(dot.y);
            }
        }

        super.invokeDrawDots(dotsX, dotsY, this.dotRadius, this.dotColor);
    }

    private createThreads(startDotIndexX: number, startDotIndexY: number, endDotIndexX: number, endDotIndexY: number): void {
        // CPU, GPU, memory and GC intensive code
        // Do not extract this method in different methods

        // create variables otherwise nested properties must be retrieved in every loop cycle (performance optimization)
        const virtualBounds = this.virtualBounds;
        const dotsSpacing = this.dotsSpacing;

        const bounds = this.bounds;
        const boundsX = bounds.left;
        const boundsY = bounds.top;
        const boundsWidth = bounds.width;
        const boundsHeight = bounds.height;

        const threadWidth = this.threadWidth;
        const threadColor = this.threadColor;

        const visible = Array<boolean>();
        const fromDotsXPos = new Array<number>();
        const fromDotsYPos = new Array<number>();
        const toDotsXPos = new Array<number>();
        const toDotsYPos = new Array<number>();
        const widths = new Array<number>();
        const colors = new Array<string>();


        for (let dotY = startDotIndexY; dotY <= endDotIndexY; dotY += 2) {
            const dotYPosition = this.calculateDrawingY(virtualBounds, dotY, dotsSpacing);

            visible.push(true);
            fromDotsXPos.push(boundsX);
            fromDotsYPos.push(dotYPosition);
            toDotsXPos.push(boundsX + boundsWidth);
            toDotsYPos.push(dotYPosition);
            widths.push(threadWidth);
            colors.push(threadColor);
        }

        for (let dotX = startDotIndexX; dotX <= endDotIndexX; dotX += 2) {

            const dotXPosition = this.calculateDrawingX(virtualBounds, dotX, dotsSpacing);

            visible.push(true);
            fromDotsXPos.push(dotXPosition);
            fromDotsYPos.push(boundsY);
            toDotsXPos.push(dotXPosition);
            toDotsYPos.push(boundsY + boundsHeight);
            widths.push(threadWidth);
            colors.push(threadColor);
        }

        super.invokeDrawThreads(visible, fromDotsXPos, fromDotsYPos, toDotsXPos, toDotsYPos, widths, colors);
    }
}