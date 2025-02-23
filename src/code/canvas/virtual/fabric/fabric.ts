import { FabricCanvasBase } from "./base.js";
import { CanvasConfig } from "../../types.js";
import { IInputCanvas } from "../../input/types.js";

export class FabricCanvas extends FabricCanvasBase {
    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);
    }

    protected override redraw(): void {
        const drawingBoundsIndexes = this.drawingBoundsIndexes;
        const leftTopIndex = drawingBoundsIndexes.leftTop;
        const rightTopIndex = drawingBoundsIndexes.rightTop;
        const leftBottomIndex = drawingBoundsIndexes.leftBottom;

        const startIndexX = leftTopIndex.indexX % 2 === 0
            ? leftTopIndex.indexX
            : leftTopIndex.indexX + 1;

        const startIndexY = leftTopIndex.indexY % 2 === 0
            ? leftTopIndex.indexY
            : leftTopIndex.indexY + 1;

        this.createThreads(startIndexX, startIndexY, rightTopIndex.indexX, leftBottomIndex.indexY);
        this.createDots(startIndexX, startIndexY, rightTopIndex.indexX, leftBottomIndex.indexY);
    }

    private createDots(startIndexX: number, startIndexY: number, endIndexX: number, endIndexY: number): void {
        // CPU, GPU, memory and GC intensive code
        // Do not extract this method in different methods

        const dotsX = new Array<number>();
        const dotsY = new Array<number>();

        for (let dotY = startIndexY; dotY <= endIndexY; dotY += 2) {
            for (let dotX = startIndexX; dotX <= endIndexX; dotX += 2) {

                const dotIndex = { indexX: dotX, indexY: dotY };
                const dot = super.calculateDrawingPosition(dotIndex);
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
        const drawingBounds = this.drawingBounds;
        const drawingBoundsX = drawingBounds.left;
        const drawingBoundsY = drawingBounds.top;
        const drawingBoundsWidth = drawingBounds.width;
        const drawingBoundsHeight = drawingBounds.height;

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
            const dotYPosition = super.calculateDrawingY(dotY);

            visible.push(true);
            fromDotsXPos.push(drawingBoundsX);
            fromDotsYPos.push(dotYPosition);
            toDotsXPos.push(drawingBoundsX + drawingBoundsWidth);
            toDotsYPos.push(dotYPosition);
            widths.push(threadWidth);
            colors.push(threadColor);
        }

        for (let dotX = startDotIndexX; dotX <= endDotIndexX; dotX += 2) {

            const dotXPosition = super.calculateDrawingX(dotX);

            visible.push(true);
            fromDotsXPos.push(dotXPosition);
            fromDotsYPos.push(drawingBoundsY);
            toDotsXPos.push(dotXPosition);
            toDotsYPos.push(drawingBoundsY + drawingBoundsHeight);
            widths.push(threadWidth);
            colors.push(threadColor);
        }

        super.invokeDrawThreads(visible, fromDotsXPos, fromDotsYPos, toDotsXPos, toDotsYPos, widths, colors);
    }
}