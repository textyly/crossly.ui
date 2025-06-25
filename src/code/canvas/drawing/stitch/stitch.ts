import { CanvasBase } from "../../base.js";
import assert from "../../../asserts/assert.js";
import { BoundsChangeEvent, DrawingMode } from "../../types.js";
import { IStitchDrawingCanvas, IStitchRasterDrawingCanvas } from "../types.js";
import { DrawStitchPatternEvent, DrawStitchSegmentEvent, IStitchCanvas } from "../../virtual/types.js";

export class StitchDrawingCanvas extends CanvasBase implements IStitchDrawingCanvas {
    private readonly stitchCanvas: IStitchCanvas;
    private readonly rasterDrawing: IStitchRasterDrawingCanvas;

    private drawingMode: DrawingMode;

    constructor(stitchCanvas: IStitchCanvas, rasterDrawing: IStitchRasterDrawingCanvas, drawingMode: DrawingMode) {
        super(StitchDrawingCanvas.name);

        this.stitchCanvas = stitchCanvas;
        this.rasterDrawing = rasterDrawing;
        this.drawingMode = drawingMode;

        this.subscribe();
    }

    public suspend(): void {
        this.drawingMode = DrawingMode.Suspend;
    }

    public resume(): void {
        this.drawingMode = DrawingMode.Draw;
    }

    public override dispose(): void {
        this.ensureAlive();
        this.clear();
        super.dispose();
    }

    private handleDrawPattern(event: DrawStitchPatternEvent): void {
        this.ensureAlive();

        if (this.drawingMode === DrawingMode.Draw) {
            const pattern = event.pattern;
            if (pattern.length > 0) {
                const density = event.density;
                this.rasterDrawing.drawLines(pattern, density);
            }
        }
    }

    private handleDrawSegment(event: DrawStitchSegmentEvent): void {
        this.ensureAlive();

        if (this.drawingMode === DrawingMode.Draw) {
            const segment = event.segment;
            const density = event.density;

            this.rasterDrawing.drawLine(segment, density);
        }
    }

    private handleRedraw(): void {
        this.ensureAlive();

        if (this.drawingMode === DrawingMode.Draw) {
            this.clear();
        }
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        this.ensureAlive();

        const bounds = event.bounds;
        super.bounds = bounds;
        this.rasterDrawing.bounds = bounds;
    }

    private async handleMoveStart(): Promise<void> {
        this.ensureAlive();

        if (this.drawingMode === DrawingMode.Draw) {
            const bitmap = await this.rasterDrawing.createBitMap();
            assert.defined(bitmap, "bitmap");

            this.clear();

            this.rasterDrawing.drawBitMap(bitmap);
        }
    }

    private handleMoveStop(): void {
        this.ensureAlive();

        if (this.drawingMode === DrawingMode.Draw) {
            this.clear();
        }
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
        super.registerUn(drawSegmentUn);
    }
}