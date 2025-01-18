import { Size } from "../types.js";
import { CanvasBase } from "../base.js";
import { IDrawingCanvas, IRasterDrawing } from "./types.js";
import { DrawLineEvent, ILineVirtualCanvas } from "../virtual/types.js";

export class LineCanvas extends CanvasBase implements IDrawingCanvas<ILineVirtualCanvas> {
    private readonly rasterDrawing: IRasterDrawing;

    constructor(rasterDrawing: IRasterDrawing) {
        super();
        this.rasterDrawing = rasterDrawing;
    }

    public subscribe(lineVirtualCanvas: ILineVirtualCanvas): void {
        const drawLineUn = lineVirtualCanvas.onDrawLine(this.handleDrawLine.bind(this));
        super.registerUn(drawLineUn);

        const sizeChangedUn = lineVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangedUn);
    }

    private handleDrawLine(event: DrawLineEvent): void {
        const line = event.line;
        this.rasterDrawing.drawLine(line);
    }

    private handleSizeChange(size: Size): void {
        super.size = size;
        this.rasterDrawing.size = size;
    }
}