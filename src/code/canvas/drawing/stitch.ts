import assert from "../../asserts/assert.js";
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
        assert.isDefined(this.stitchCanvas, "stitchCanvas");

        this.rasterDrawing = rasterDrawing;
        assert.isDefined(this.rasterDrawing, "rasterDrawing");

        this.subscribe();
    }

    public override dispose(): void {
        this.throwIfDisposed();
        this.clear();
        super.dispose();
    }

    private handleDrawThreads(event: DrawStitchThreadsEvent): void {
        this.throwIfDisposed();

        const threads = event.threads;
        if (threads.length > 0) {
            const density = event.density;
            this.rasterDrawing.drawLines(threads, density);
        }
    }

    private handleRedraw(): void {
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        this.throwIfDisposed();

        const bounds = event.bounds;
        super.bounds = bounds;
        this.rasterDrawing.bounds = bounds;
    }

    private async handleMoveStart(): Promise<void> {
        this.throwIfDisposed();

        const bitmap = await this.rasterDrawing.createBitMap();
        this.clear();

        this.rasterDrawing.drawBitMap(bitmap);
    }

    private handleMoveStop(): void {
        this.throwIfDisposed();
        this.clear();
    }

    private clear(): void {
        this.throwIfDisposed();
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