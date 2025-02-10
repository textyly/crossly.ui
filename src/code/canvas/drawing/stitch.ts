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

        threads.forEach((thread) => {
            // this.rasterVirtualDrawing.drawDots([thread.from, thread.to], event.dotRadius, thread.color);
        });

        
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