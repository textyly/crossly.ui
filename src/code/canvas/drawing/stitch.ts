import { CanvasBase } from "../base.js";
import { BoundsChangeEvent, Dot } from "../types.js";
import { IRasterDrawingCanvas, IStitchDrawingCanvas } from "./types.js";
import { DrawStitchDotsEvent, DrawStitchThreadsEvent, IStitchCanvas } from "../virtual/types.js";

export class StitchDrawingCanvas extends CanvasBase implements IStitchDrawingCanvas {
    private readonly rasterDrawing: IRasterDrawingCanvas;

    constructor(rasterDrawing: IRasterDrawingCanvas) {
        super();
        this.rasterDrawing = rasterDrawing;
    }

    public subscribe(stitchCanvas: IStitchCanvas): void {
        const redrawUn = stitchCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const boundsChangeUn = stitchCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);

        const drawDotsUn = stitchCanvas.onDrawDots(this.handleDrawDots.bind(this));
        super.registerUn(drawDotsUn);

        const drawThreadsUn = stitchCanvas.onDrawThreads(this.handleDrawThreads.bind(this));
        super.registerUn(drawThreadsUn);
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawDots(event: DrawStitchDotsEvent): void {
        const dotsX = event.dotsX;
        const dotsY = event.dotsY;
        const dotRadius = event.dotRadius;
        const dotColor = event.dotColor;

        this.rasterDrawing.drawDots(dotsX, dotsY, dotRadius, dotColor);
    }

    private handleDrawThreads(event: DrawStitchThreadsEvent): void {
        const threads = event.threads;
        this.rasterDrawing.drawLines(threads);
    }

    private handleRedraw(): void {
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        const bounds = event.bounds;
        super.bounds = bounds;
        this.rasterDrawing.bounds = bounds;
    }

    private clear(): void {
        this.rasterDrawing.clear();
    }
}