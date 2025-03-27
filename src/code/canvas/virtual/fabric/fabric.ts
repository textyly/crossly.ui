import { FabricCanvasBase } from "./base.js";
import assert from "../../../asserts/assert.js";
import { IInputCanvas } from "../../input/types.js";
import { FabricCanvasConfig } from "../../../config/types.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { ThreadArray } from "../../utilities/arrays/thread/array.js";

export class FabricCanvas extends FabricCanvasBase {
    private dotColor: string;
    private dotRadius: number;
    private minDotRadius: number;
    private dotRadiusZoomStep: number;

    private threadColor: string;
    private threadWidth: number;
    private minThreadWidth: number;
    private threadWidthZoomStep: number;

    constructor(config: FabricCanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);

        const dotConfig = config.dot;
        const threadConfig = config.thread;

        this.dotColor = dotConfig.color;
        assert.greaterThanZero(this.dotColor.length, "dotColor.length");

        this.dotRadius = dotConfig.radius;
        assert.greaterThanZero(this.dotRadius, "dotRadius");

        this.minDotRadius = dotConfig.minRadius;
        assert.greaterThanZero(this.minDotRadius, "minDotRadius");

        this.dotRadiusZoomStep = dotConfig.radiusZoomStep;
        assert.greaterThanZero(this.dotRadiusZoomStep, "dotRadiusZoomStep");

        this.threadColor = threadConfig.color;
        assert.greaterThanZero(this.threadColor.length, "threadColor.length");

        this.threadWidth = threadConfig.width;
        assert.greaterThanZero(this.threadWidth, "threadWidth");

        this.minThreadWidth = threadConfig.minWidth;
        assert.greaterThanZero(this.minThreadWidth, "minThreadWidth");

        this.threadWidthZoomStep = threadConfig.widthZoomStep;
        assert.greaterThanZero(this.threadWidthZoomStep, "threadWidthZoomStep");
    }

    protected override zoomIn(): void {
        this.dotRadius += this.dotRadiusZoomStep;
        this.threadWidth += this.threadWidthZoomStep;
    }

    protected override zoomOut(): void {
        this.dotRadius -= this.dotRadiusZoomStep;
        this.threadWidth -= this.threadWidthZoomStep;
    }

    protected override redraw(): void {
        const boundsIndexes = this.calculateBoundsIndexes();

        const leftTopIndexX = boundsIndexes.leftTop.dotX;
        const startIndexX = leftTopIndexX % 2 === 0 ? leftTopIndexX : leftTopIndexX + 1;

        const leftTopIndexY = boundsIndexes.leftTop.dotY;
        const startIndexY = leftTopIndexY % 2 === 0 ? leftTopIndexY : leftTopIndexY + 1;

        const endIndexX = boundsIndexes.rightTop.dotX;
        const endIndexY = boundsIndexes.leftBottom.dotY;

        const canRedrawThreads = (this.threadWidth >= this.minThreadWidth);
        if (canRedrawThreads) {
            this.redrawThreads(startIndexX, startIndexY, endIndexX, endIndexY);
        }

        const canRedrawDots = !this.inMovingMode && (this.dotRadius >= this.minDotRadius);
        if (canRedrawDots) {
            this.redrawDots(startIndexX, startIndexY, endIndexX, endIndexY);
        }
    }

    private redrawThreads(startDotIndexX: number, startDotIndexY: number, endDotIndexX: number, endDotIndexY: number): void {
        // CPU, GPU, memory and GC intensive code
        // Do not create types/classes for thread (objects are extremely slow and memory/GC consuming)

        const bounds = this.bounds;
        const threads = new ThreadArray();

        for (let dotYIdx = startDotIndexY; dotYIdx <= endDotIndexY; dotYIdx += 2) {

            const dotYPos = this.calculateDotYPosition(dotYIdx);
            threads.push(true, bounds.left, dotYPos, bounds.left + bounds.width, dotYPos, this.threadWidth, this.threadColor);
        }

        for (let dotXIdX = startDotIndexX; dotXIdX <= endDotIndexX; dotXIdX += 2) {

            const dotXPos = this.calculateDotXPosition(dotXIdX);
            threads.push(true, dotXPos, bounds.top, dotXPos, bounds.top + bounds.height, this.threadWidth, this.threadColor);
        }

        super.invokeDrawThreads(threads);
    }

    private redrawDots(startIndexX: number, startIndexY: number, endIndexX: number, endIndexY: number): void {
        // CPU, GPU, memory and GC intensive code
        // Do not create types/classes for dot (objects are extremely slow and memory/GC consuming)

        const dots = new DotArray();

        for (let dotYIdx = startIndexY; dotYIdx <= endIndexY; dotYIdx += 2) {
            for (let dotXIdX = startIndexX; dotXIdX <= endIndexX; dotXIdX += 2) {

                const dotIdx = { dotX: dotXIdX, dotY: dotYIdx };
                const dotPos = this.calculateDotPosition(dotIdx);
                dots.push(dotPos.x, dotPos.y, this.dotRadius, this.dotColor);
            }
        }

        super.invokeDrawDots(dots);
    }
}