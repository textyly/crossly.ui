import { CanvasBase } from "../base.js";
import { BoundsChangeEvent } from "../types.js";
import { IRasterDrawingCanvas, IStitchDrawingCanvas } from "./types.js";
import { DrawStitchThreadsEvent, IStitchCanvas } from "../virtual/types.js";

export class StitchDrawingCanvas extends CanvasBase implements IStitchDrawingCanvas {
    private readonly stitchCanvas: IStitchCanvas;
    private readonly rasterDrawing: IRasterDrawingCanvas;

    constructor(stitchCanvas: IStitchCanvas, rasterDrawing: IRasterDrawingCanvas) {
        super();
        this.stitchCanvas = stitchCanvas;
        this.rasterDrawing = rasterDrawing;

        this.subscribe();
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawThreads(event: DrawStitchThreadsEvent): void {
        const threads = event.threads;
        if (threads.length > 0) {
            this.rasterDrawing.drawLines(threads);
        }
    }

    private handleRedraw(): void {
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        const bounds = event.bounds;
        super.bounds = bounds;
        this.rasterDrawing.bounds = bounds;
    }

    private async handleMoveStart(): Promise<void> {
        const bitmap = await this.rasterDrawing.createBitMap();
        this.clear();

        this.rasterDrawing.drawBitMap(bitmap);
    }

    private handleMoveStop(): void {
        this.clear();
    }

    private clear(): void {
        this.rasterDrawing.clear();
    }

    private subscribe(): void {
        const redrawUn = this.stitchCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const boundsChangeUn = this.stitchCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);

        const moveStartUn = this.stitchCanvas.onMoveStart(this.handleMoveStart.bind(this));
        super.registerUn(moveStartUn);

        const moveStopUn = this.stitchCanvas.onMoveStop(this.handleMoveStop.bind(this));
        super.registerUn(moveStopUn);

        const drawThreadsUn = this.stitchCanvas.onDrawThreads(this.handleDrawThreads.bind(this));
        super.registerUn(drawThreadsUn);
    }
}