import { CanvasBase } from "../base.js";
import { Dot, BoundsChangeEvent } from "../types.js";
import { IRasterDrawing, IStitchDrawingCanvas } from "./types.js";
import { DrawStitchThreadsEvent, IStitchCanvas } from "../virtual/types.js";

export class StitchDrawingCanvas extends CanvasBase implements IStitchDrawingCanvas {
    private readonly rasterDrawing: IRasterDrawing;

    constructor(rasterDrawing: IRasterDrawing) {
        super();
        this.rasterDrawing = rasterDrawing;
    }

    public subscribe(stitchCanvas: IStitchCanvas): void {
        const drawFrontThreadsUn = stitchCanvas.onDrawFrontThreads(this.handleDrawFrontThreads.bind(this));
        super.registerUn(drawFrontThreadsUn);

        const redrawUn = stitchCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const boundsChangeUn = stitchCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawFrontThreads(event: DrawStitchThreadsEvent): void {
        const threads = event.threads;

        const dots: Array<Dot> = [];
        threads.forEach((thread) => dots.push(thread.from, thread.to));

        this.rasterDrawing.drawDots(dots);
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