import { CanvasBase } from "../base.js";
import { SizeChangeEvent } from "../types.js";
import { IDrawingCanvas, IRasterDrawing } from "./types.js";
import { DrawLineEvent, IStitchCanvas } from "../virtual/types.js";

export class StitchDrawingCanvas extends CanvasBase implements IDrawingCanvas<IStitchCanvas> {
    private readonly rasterDrawing: IRasterDrawing;

    constructor(rasterDrawing: IRasterDrawing) {
        super();
        this.rasterDrawing = rasterDrawing;
    }

    public subscribe(lineVirtualCanvas: IStitchCanvas): void {
        const drawLineUn = lineVirtualCanvas.onDrawLine(this.handleDrawLine.bind(this));
        super.registerUn(drawLineUn);

        const sizeChangeUn = lineVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    private handleDrawLine(event: DrawLineEvent): void {
        const line = event.line;
        this.rasterDrawing.drawLine(line);
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
        this.rasterDrawing.size = size;
    }
}