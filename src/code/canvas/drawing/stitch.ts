import { CanvasBase } from "../base.js";
import { SizeChangeEvent } from "../types.js";
import { IDrawingCanvas, IRasterDrawing } from "./types.js";
import { DrawStitchDotEvent, DrawStitchLineEvent, IStitchCanvas } from "../virtual/types.js";

export class StitchDrawingCanvas extends CanvasBase implements IDrawingCanvas<IStitchCanvas> {
    private readonly rasterDrawing: IRasterDrawing;

    constructor(rasterDrawing: IRasterDrawing) {
        super();
        this.rasterDrawing = rasterDrawing;
    }

    public subscribe(stitchCanvas: IStitchCanvas): void {
        const drawFrontDotUn = stitchCanvas.onDrawFrontDot(this.handleDrawFrontDot.bind(this));
        super.registerUn(drawFrontDotUn);

        const drawFrontLineUn = stitchCanvas.onDrawFrontLine(this.handleDrawFrontLine.bind(this));
        super.registerUn(drawFrontLineUn);

        const redrawUn = stitchCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const sizeChangeUn = stitchCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    private handleDrawFrontLine(event: DrawStitchLineEvent): void {
        const line = event.line;
        this.rasterDrawing.drawLine(line);
    }

    private handleDrawFrontDot(event: DrawStitchDotEvent): void {
        const dot = event.dot;
        this.rasterDrawing.drawDot(dot);
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