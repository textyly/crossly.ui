import { CanvasBase } from "../base.js";
import { Dot, BoundsChangeEvent } from "../types.js";
import { DrawStitchThreadsEvent, IStitchCanvas } from "../virtual/types.js";
import { IStitchDrawingCanvas, IRasterVirtualDrawingCanvas } from "./types.js";

export class StitchDrawingCanvas extends CanvasBase implements IStitchDrawingCanvas {
    private readonly rasterVirtualDrawing: IRasterVirtualDrawingCanvas;

    constructor(rasterVirtualDrawing: IRasterVirtualDrawingCanvas) {
        super();
        this.rasterVirtualDrawing = rasterVirtualDrawing;
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

        this.rasterVirtualDrawing.drawDots(dots);
        this.rasterVirtualDrawing.drawLines(threads);
    }

    private handleRedraw(): void {
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        const bounds = event.bounds;
        super.bounds = bounds;
        this.rasterVirtualDrawing.bounds = bounds;
    }

    private clear(): void {
        this.rasterVirtualDrawing.clear();
    }
}