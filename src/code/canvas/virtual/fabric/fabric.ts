import { FabricCanvasBase } from "./base.js";
import { CanvasConfig } from "../../types.js";
import { IInputCanvas } from "../../input/types.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { FabricThreadArray } from "../../utilities/arrays/thread/fabric.js";

export class FabricCanvas extends FabricCanvasBase {
    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);
    }

    protected override redraw(): void {
        const boundsIndexes = this.calculateBoundsIndexes();

        const leftTopIndexX = boundsIndexes.leftTop.dotX;
        const startIndexX = leftTopIndexX % 2 === 0 ? leftTopIndexX : leftTopIndexX + 1;

        const leftTopIndexY = boundsIndexes.leftTop.dotY;
        const startIndexY = leftTopIndexY % 2 === 0 ? leftTopIndexY : leftTopIndexY + 1;

        const endIndexX = boundsIndexes.rightTop.dotX;
        const endIndexY = boundsIndexes.leftBottom.dotY;

        this.createThreads(startIndexX, startIndexY, endIndexX, endIndexY);
        this.createDots(startIndexX, startIndexY, endIndexX, endIndexY);
    }

    private createThreads(startDotIndexX: number, startDotIndexY: number, endDotIndexX: number, endDotIndexY: number): void {
        // CPU, GPU, memory and GC intensive code

        const bounds = this.bounds;
        const threadWidth = this.threadWidth;
        const threadColor = this.threadColor;
        const threads = new FabricThreadArray();

        for (let dotY = startDotIndexY; dotY <= endDotIndexY; dotY += 2) {

            const dotYPos = this.calculateDotY(dotY);
            threads.push(true, bounds.left, dotYPos, bounds.left + bounds.width, dotYPos, threadWidth, threadColor);
        }

        for (let dotX = startDotIndexX; dotX <= endDotIndexX; dotX += 2) {

            const dotXPos = this.calculateDotX(dotX);
            threads.push(true, dotXPos, bounds.top, dotXPos, bounds.top + bounds.height, threadWidth, threadColor);
        }

        super.invokeDrawThreads(threads);
    }

    private createDots(startIndexX: number, startIndexY: number, endIndexX: number, endIndexY: number): void {
        // CPU, GPU, memory and GC intensive code

        const dots = new DotArray();

        for (let dotY = startIndexY; dotY <= endIndexY; dotY += 2) {
            for (let dotX = startIndexX; dotX <= endIndexX; dotX += 2) {

                const dotIndex = { dotX, dotY };
                const dotPos = this.calculateDotPosition(dotIndex);
                dots.push(dotPos, this.dotRadius, this.dotColor);
            }
        }

        super.invokeDrawDots(dots);
    }
}