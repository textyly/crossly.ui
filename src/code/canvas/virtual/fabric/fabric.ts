import { FabricCanvasBase } from "./base.js";
import { CanvasConfig } from "../../types.js";
import { IInputCanvas } from "../../input/types.js";

export class FabricCanvas extends FabricCanvasBase {
    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);
    }

    protected override redraw(): void {
        const drawingWidth = this.calculateDrawingWidth();
        const drawingHeight = this.calculateDrawingHeight();

        const drawingLeftTopIndex = this.calculateDrawingLeftTopIndex();
        const drawingLeftTop = super.calculatePosition(drawingLeftTopIndex);

        const drawingRightTop = { x: drawingLeftTop.x + drawingWidth, y: drawingLeftTop.y };
        const drawingRightTopIndex = super.calculateIndex(drawingRightTop);

        const drawingLeftBottom = { x: drawingLeftTop.x, y: drawingLeftTop.y + drawingHeight };
        const drawingLeftBottomIndex = super.calculateIndex(drawingLeftBottom);

        const startIndexX = drawingLeftTopIndex.indexX % 2 === 0 ? drawingLeftTopIndex.indexX : ++drawingLeftTopIndex.indexX;
        const startIndexY = drawingLeftTopIndex.indexY % 2 === 0 ? drawingLeftTopIndex.indexY : ++drawingLeftTopIndex.indexY;

        this.createThreads(startIndexX, startIndexY, drawingRightTopIndex.indexX, drawingLeftBottomIndex.indexY);
        this.createDots(startIndexX, startIndexY, drawingRightTopIndex.indexX, drawingLeftBottomIndex.indexY);
    }

    private createDots(startIndexX: number, startIndexY: number, endIndexX: number, endIndexY: number): void {
        // CPU, GPU, memory and GC intensive code
        // Do not extract this method in different methods

        const dotsX = new Array<number>();
        const dotsY = new Array<number>();

        for (let dotY = startIndexY; dotY <= endIndexY; dotY += 2) {
            for (let dotX = startIndexX; dotX <= endIndexX; dotX += 2) {

                const dotIndex = { indexX: dotX, indexY: dotY };
                const dot = super.calculatePosition(dotIndex);
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
        const virtualBoundsX = virtualBounds.left;
        const virtualBoundsY = virtualBounds.top;
        const virtualBoundsWidth = virtualBounds.width;
        const virtualBoundsHeight = virtualBounds.height;

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
            const dotYPosition = super.calculateY(dotY);

            visible.push(true);
            fromDotsXPos.push(virtualBoundsX);
            fromDotsYPos.push(dotYPosition);
            toDotsXPos.push(virtualBoundsX + virtualBoundsWidth);
            toDotsYPos.push(dotYPosition);
            widths.push(threadWidth);
            colors.push(threadColor);
        }

        for (let dotX = startDotIndexX; dotX <= endDotIndexX; dotX += 2) {

            const dotXPosition = super.calculateX(dotX);

            visible.push(true);
            fromDotsXPos.push(dotXPosition);
            fromDotsYPos.push(virtualBoundsY);
            toDotsXPos.push(dotXPosition);
            toDotsYPos.push(virtualBoundsY + virtualBoundsHeight);
            widths.push(threadWidth);
            colors.push(threadColor);
        }

        super.invokeDrawThreads(visible, fromDotsXPos, fromDotsYPos, toDotsXPos, toDotsYPos, widths, colors);
    }
}