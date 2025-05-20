import { FabricCanvasBase } from "./base.js";
import assert from "../../../asserts/assert.js";
import { IInputCanvas } from "../../input/types.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { FabricCanvasConfig } from "../../../config/types.js";
import { FabricThreadArray } from "../../utilities/arrays/thread/fabric.js";

export abstract class FabricCanvas extends FabricCanvasBase {
    protected _name: string;
    protected _color: string;

    protected _dotsColor: string;
    private dotRadius: number;
    private dotMinRadius: number;
    private dotRadiusZoomStep: number;

    protected _threadsColor: string;
    private threadWidth: number;
    private threadMinWidth: number;
    private threadWidthZoomStep: number;

    constructor(config: FabricCanvasConfig, inputCanvas: IInputCanvas) {
        super(FabricCanvas.name, config, inputCanvas);

        this.validateConfig(config);

        this._name = config.name;
        this._color = config.color;

        const dotConfig = config.dots;
        const threadConfig = config.threads;

        this._dotsColor = dotConfig.color;
        this.dotRadius = dotConfig.radius;
        this.dotMinRadius = dotConfig.minRadius;
        this.dotRadiusZoomStep = dotConfig.radiusZoomStep;

        this._threadsColor = threadConfig.color;
        this.threadWidth = threadConfig.width;
        this.threadMinWidth = threadConfig.minWidth;
        this.threadWidthZoomStep = threadConfig.widthZoomStep;
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
        const boundsIndexes = this.calculateVisibleBoundsIndexes();

        const leftTopIndexX = boundsIndexes.leftTop.dotX;
        const startIndexX = leftTopIndexX % 2 === 0 ? leftTopIndexX : leftTopIndexX + 1;

        const leftTopIndexY = boundsIndexes.leftTop.dotY;
        const startIndexY = leftTopIndexY % 2 === 0 ? leftTopIndexY : leftTopIndexY + 1;

        const endIndexX = boundsIndexes.rightTop.dotX;
        const endIndexY = boundsIndexes.leftBottom.dotY;

        const canRedrawThreads = (this.threadWidth >= this.threadMinWidth);
        if (canRedrawThreads) {
            this.redrawThreads(startIndexX, startIndexY, endIndexX, endIndexY);
        }

        const canRedrawDots = !this.inMovingMode && (this.dotRadius >= this.dotMinRadius);
        if (canRedrawDots) {
            this.redrawDots(startIndexX, startIndexY, endIndexX, endIndexY);
        }
    }

    private redrawThreads(startDotIndexX: number, startDotIndexY: number, endDotIndexX: number, endDotIndexY: number): void {
        // CPU, GPU, memory and GC intensive code
        // Do not create types/classes for thread (objects are extremely slow and memory/GC consuming)

        const bounds = this.bounds;
        const threads = new FabricThreadArray(this._threadsColor, this.threadWidth);

        for (let dotYIdx = startDotIndexY; dotYIdx <= endDotIndexY; dotYIdx += 2) {

            const dotYPos = this.calculateDotYPosition(dotYIdx);
            threads.push(bounds.left, dotYPos, bounds.left + bounds.width, dotYPos);
        }

        for (let dotXIdX = startDotIndexX; dotXIdX <= endDotIndexX; dotXIdX += 2) {

            const dotXPos = this.calculateDotXPosition(dotXIdX);
            threads.push(dotXPos, bounds.top, dotXPos, bounds.top + bounds.height);
        }

        super.invokeDrawThreads(threads);
    }

    private redrawDots(startIndexX: number, startIndexY: number, endIndexX: number, endIndexY: number): void {
        // CPU, GPU, memory and GC intensive code
        // Do not create types/classes for dot (objects are extremely slow and memory/GC consuming)

        const dots = new DotArray(this._dotsColor, this.dotRadius);

        for (let dotYIdx = startIndexY; dotYIdx <= endIndexY; dotYIdx += 2) {
            for (let dotXIdX = startIndexX; dotXIdX <= endIndexX; dotXIdX += 2) {

                const dotIdx = { dotX: dotXIdX, dotY: dotYIdx };
                const dotPos = this.calculateDotPosition(dotIdx);
                dots.push(dotPos.x, dotPos.y);
            }
        }

        super.invokeDrawDots(dots);
    }

    private validateConfig(config: FabricCanvasConfig): void {
        const dotConfig = config.dots;
        assert.greaterThanZero(dotConfig.radius, "dotRadius");
        assert.greaterThanZero(dotConfig.minRadius, "minDotRadius");
        assert.greaterThanZero(dotConfig.radiusZoomStep, "dotRadiusZoomStep");
        assert.greaterThanZero(dotConfig.color.length, "dotColor.length");

        const threadConfig = config.threads;
        assert.greaterThanZero(threadConfig.width, "threadWidth");
        assert.greaterThanZero(threadConfig.minWidth, "minThreadWidth");
        assert.greaterThanZero(threadConfig.widthZoomStep, "threadWidthZoomStep");
        assert.greaterThanZero(threadConfig.color.length, "threadColor.length");
    }
}