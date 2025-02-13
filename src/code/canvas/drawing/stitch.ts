import { CanvasBase } from "../base.js";
import { BoundsChangeEvent, Dot } from "../types.js";
import { IRasterDrawingCanvas, IStitchDrawingCanvas } from "./types.js";
import { DrawStitchThreadsEvent, IStitchCanvas } from "../virtual/types.js";

export class StitchDrawingCanvas extends CanvasBase implements IStitchDrawingCanvas {
    private readonly rasterDrawing: IRasterDrawingCanvas;

    constructor(rasterDrawing: IRasterDrawingCanvas) {
        super();
        this.rasterDrawing = rasterDrawing;
    }

    public subscribe(stitchCanvas: IStitchCanvas): void {
        const drawThreadsUn = stitchCanvas.onDrawThreads(this.handleDrawThreads.bind(this));
        super.registerUn(drawThreadsUn);

        const redrawUn = stitchCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const boundsChangeUn = stitchCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawThreads(event: DrawStitchThreadsEvent): void {
        const threads = event.threads;

        // TODO: dots must be drawn in one call!!!
        threads.forEach((thread) => {
            const dotsX = [thread.from.x, thread.to.x];
            const dotsY = [thread.from.y, thread.to.y];
            this.rasterDrawing.drawDots(dotsX, dotsY, thread.dotRadius, thread.color);
        });

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