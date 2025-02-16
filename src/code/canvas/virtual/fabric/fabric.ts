import { DotIndex } from "../types.js";
import { FabricCanvasBase } from "./base.js";
import { IInputCanvas } from "../../input/types.js";
import { FabricThread, CanvasConfig } from "../../types.js";

export class FabricCanvas extends FabricCanvasBase {
    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);
    }

    protected override redraw(): void {
        const leftTopDotIndex = this.calculateLeftTopDotIndex();
        const leftTopDotPosition = super.calculateDotPosition(leftTopDotIndex);

        const width = this.calculateWidth();
        const height = this.calculateHeight();

        // console.log(`x: ${x}, y: ${y}, width: ${width}, height: ${height}`);

        const widthDotIndex = super.calculateDotIndex({ x: leftTopDotPosition.x + width, y: leftTopDotPosition.y });
        const heightDotIndex = super.calculateDotIndex({ x: leftTopDotPosition.x, y: leftTopDotPosition.y + height });

        // console.log(`dotIndex: ${JSON.stringify(dotIndex)}, widthIndex: ${JSON.stringify(widthIndex)}, heightIndex: ${JSON.stringify(heightIndex)}`);

        const startDotIndexX = leftTopDotIndex.indexX % 2 === 0 ? leftTopDotIndex.indexX : ++leftTopDotIndex.indexX;
        const startDotIndexY = leftTopDotIndex.indexY % 2 === 0 ? leftTopDotIndex.indexY : ++leftTopDotIndex.indexY;

        // console.log(`dotIndexX: ${dotIndexX} - heightIndex: ${widthIndex}`);
        // console.log(`dotIndexY: ${dotIndexY} - heightIndex: ${heightIndex}`);

        // do not create threads on movie if the width is too small because it is not visible anyway!!!
        this.createThreads(startDotIndexX, startDotIndexY, widthDotIndex.indexX, heightDotIndex.indexY);

        // TODO: do not crate dots on move!!!
        this.createDots(startDotIndexX, startDotIndexY, widthDotIndex.indexX, heightDotIndex.indexY);
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

        const threadsX = new Array<FabricThread>();
        const threadsY = new Array<FabricThread>();

        for (let dotY = startDotIndexY; dotY <= heightDotIndexY; dotY += 2) {

            const dotYPosition = super.calculateDotYPosition(dotY);
            const from = { x: virtualBoundsX, y: dotYPosition };
            const to = { x: virtualBoundsX + virtualBoundsWidth, y: dotYPosition }
            threadsY.push({ from, to, width: threadWidth, color: threadColor });
        }

        for (let dotX = startDotIndexX; dotX <= widthDotIndexX; dotX += 2) {

            const dotXPosition = super.calculateDotXPosition(dotX);
            const from = { x: dotXPosition, y: virtualBoundsY };
            const to = { x: dotXPosition, y: virtualBoundsY + virtualBoundsHeight };
            threadsX.push({ from, to, width: threadWidth, color: threadColor });
        }

        const threads = [...threadsX, ...threadsY];
        super.invokeDrawThreads(threads);
    }

    private calculateLeftTopDotIndex(): DotIndex {
        const leftTopX = this.virtualBounds.left < this.bounds.left
            ? this.bounds.left
            : Math.min(this.virtualBounds.left, (this.bounds.left + this.bounds.width));

        const leftTop = this.virtualBounds.top < this.bounds.top
            ? this.bounds.top
            : Math.min(this.virtualBounds.top, (this.bounds.top + this.bounds.width));

        const leftTopDot = { x: leftTopX, y: leftTop };
        const leftTopDotIndex = super.calculateDotIndex(leftTopDot);

        return leftTopDotIndex;
    }

    private calculateWidth(): number {
        if (this.virtualBounds.left < this.bounds.left) {
            const virtualWidth = this.virtualBounds.width - (Math.abs(this.virtualBounds.left) + Math.abs(this.bounds.left));
            return Math.min(virtualWidth, this.bounds.width);
        } else {
            const offsetBoundsWidth = this.bounds.left + this.bounds.width;
            const offsetVirtualWidth = this.virtualBounds.left + this.virtualBounds.width;

            if (offsetVirtualWidth <= offsetBoundsWidth) {
                return this.virtualBounds.width;
            } else {
                return (this.bounds.width - this.virtualBounds.left);
            }
        }
    }

    private calculateHeight(): number {
        if (this.virtualBounds.top < this.bounds.top) {
            const virtualHeight = this.virtualBounds.height - (Math.abs(this.virtualBounds.top) + Math.abs(this.bounds.top));
            return Math.min(virtualHeight, this.bounds.height);
        } else {
            const offsetBoundsHeight = this.bounds.top + this.bounds.height;
            const offsetVirtualHeight = this.virtualBounds.top + this.virtualBounds.height;

            if (offsetVirtualHeight <= offsetBoundsHeight) {
                return this.virtualBounds.height;
            } else {
                return (this.bounds.height - this.virtualBounds.top);
            }
        }
    }
}