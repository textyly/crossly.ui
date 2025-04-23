import { CanvasBase } from "../base.js";
import assert from "../../asserts/assert.js";
import { BoundsChangeEvent } from "../types.js";
import { IStitchDrawingCanvas, IStitchRasterDrawingCanvas } from "./types.js";
import { DrawStitchPatternEvent, DrawStitchSegmentEvent, IStitchCanvas } from "../virtual/types.js";

export class StitchDrawingCanvas extends CanvasBase implements IStitchDrawingCanvas {
    private readonly stitchCanvas: IStitchCanvas;
    private readonly rasterDrawing: IStitchRasterDrawingCanvas;

    constructor(stitchCanvas: IStitchCanvas, rasterDrawing: IStitchRasterDrawingCanvas) {
        super(StitchDrawingCanvas.name);

        this.stitchCanvas = stitchCanvas;
        assert.defined(this.stitchCanvas, "stitchCanvas");

        this.rasterDrawing = rasterDrawing;
        assert.defined(this.rasterDrawing, "rasterDrawing");

        this.subscribe();
    }

    public override dispose(): void {
        this.ensureAlive();
        this.clear();
        super.dispose();
    }

    private handleDrawPattern(event: DrawStitchPatternEvent): void {
        this.ensureAlive();
        assert.defined(event, "DrawStitchPatternEvent");

        const pattern = event.pattern;
        if (pattern.length > 0) {
            const density = event.density;
            this.rasterDrawing.drawLines(pattern, density);
        }
    }

    private handleDrawSegment(event: DrawStitchSegmentEvent): void {
        const segment = event.segment;
        const density = event.density;

        this.rasterDrawing.drawLine(segment, density);
    }

    private handleRedraw(): void {
        this.ensureAlive();
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        this.ensureAlive();

        const bounds = event.bounds;
        super.bounds = bounds;
        this.rasterDrawing.bounds = bounds;
    }

    private async handleMoveStart(): Promise<void> {
        this.ensureAlive();

        const bitmap = await this.rasterDrawing.createBitMap();
        assert.defined(bitmap, "bitmap");

        this.clear();

        this.rasterDrawing.drawBitMap(bitmap);
    }

    private handleMoveStop(): void {
        this.ensureAlive();
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

        const drawPatternUn = this.stitchCanvas.onDrawPattern(this.handleDrawPattern.bind(this));
        super.registerUn(drawPatternUn);

        const drawSegmentUn = this.stitchCanvas.onDrawSegment(this.handleDrawSegment.bind(this));
        super.registerUn(drawPatternUn);
    }
}