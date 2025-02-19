import { DotIndex } from "../types.js";
import { FabricCanvasBase } from "./base.js";
import { CanvasConfig } from "../../types.js";
import { IInputCanvas } from "../../input/types.js";

export class FabricCanvas extends FabricCanvasBase {
    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);
    }

    protected override redraw(): void {
        // TODO: extract in the virtual base class
        const visibleLeftTopDotIndex = this.calculateVisibleLeftTopDotIndex();
        const visibleLeftTopDotPosition = super.calculateDotPosition(visibleLeftTopDotIndex);

        const visibleWidth = this.calculateVisibleWidth();
        const visibleHeight = this.calculateVisibleHeight();

        const visibleWidthDotIndex = super.calculateDotIndex({ x: visibleLeftTopDotPosition.x + visibleWidth, y: visibleLeftTopDotPosition.y });
        const visibleHeightDotIndex = super.calculateDotIndex({ x: visibleLeftTopDotPosition.x, y: visibleLeftTopDotPosition.y + visibleHeight });
        // ---------------------------------------

        const startDotIndexX = visibleLeftTopDotIndex.indexX % 2 === 0 ? visibleLeftTopDotIndex.indexX : ++visibleLeftTopDotIndex.indexX;
        const startDotIndexY = visibleLeftTopDotIndex.indexY % 2 === 0 ? visibleLeftTopDotIndex.indexY : ++visibleLeftTopDotIndex.indexY;

        this.createThreads(startDotIndexX, startDotIndexY, visibleWidthDotIndex.indexX, visibleHeightDotIndex.indexY);
        this.createDots(startDotIndexX, startDotIndexY, visibleWidthDotIndex.indexX, visibleHeightDotIndex.indexY);
    }

    private createDots(startDotIndexX: number, startDotIndexY: number, widthDotIndexX: number, heightDotIndexY: number): void {
        // CPU, GPU, memory and GC intensive code
        // Do not extract this method in different methods

        const dotsX = new Array<number>();
        const dotsY = new Array<number>();

        for (let dotY = startDotIndexY; dotY <= heightDotIndexY; dotY += 2) {
            for (let dotX = startDotIndexX; dotX <= widthDotIndexX; dotX += 2) {

                const dotIndex = { indexX: dotX, indexY: dotY };
                const dotPosition = super.calculateDotPosition(dotIndex);
                dotsX.push(dotPosition.x);
                dotsY.push(dotPosition.y);
            }
        }

        super.invokeDrawDots(dotsX, dotsY, this.dotRadius, this.dotColor);
    }

    private createThreads(startDotIndexX: number, startDotIndexY: number, widthDotIndexX: number, heightDotIndexY: number): void {
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


        for (let dotY = startDotIndexY; dotY <= heightDotIndexY; dotY += 2) {
            const dotYPosition = super.calculateDotYPosition(dotY);

            visible.push(true);
            fromDotsXPos.push(virtualBoundsX);
            fromDotsYPos.push(dotYPosition);
            toDotsXPos.push(virtualBoundsX + virtualBoundsWidth);
            toDotsYPos.push(dotYPosition);
            widths.push(threadWidth);
            colors.push(threadColor);
        }

        for (let dotX = startDotIndexX; dotX <= widthDotIndexX; dotX += 2) {

            const dotXPosition = super.calculateDotXPosition(dotX);

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