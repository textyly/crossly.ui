import { CanvasBase } from "../base.js";
import { Dot, SizeChangeEvent } from "../types.js";
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

        const sizeChangeUn = stitchCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    private handleDrawFrontThreads(event: DrawStitchThreadsEvent): void {
        const threads = event.threads;

        const dots: Array<Dot> = [];
        threads.forEach((thread) => dots.push(thread.from, thread.to));

        this.rasterDrawing.drawDots(dots);
        this.rasterDrawing.drawLines(threads);
    }

    private handleRedraw(): void {
        this.rasterDrawing.clear();
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
        this.rasterDrawing.size = size;
    }
}