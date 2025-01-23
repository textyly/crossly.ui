import { CanvasBase } from "../base.js";
import { SizeChangeEvent } from "../types.js";
import { IDrawingCanvas, IRasterDrawing } from "./types.js";
import { DrawGridDotEvent, DrawGridLineEvent, IGridCanvas } from "../virtual/types.js";

export class GridDrawingCanvas extends CanvasBase implements IDrawingCanvas<IGridCanvas> {
    private readonly rasterDrawing: IRasterDrawing;

    constructor(rasterDrawing: IRasterDrawing) {
        super();
        this.rasterDrawing = rasterDrawing;
    }

    public subscribe(gridCanvas: IGridCanvas): void {
        const drawVisibleDotUn = gridCanvas.onDrawVisibleDot(this.handleDrawVisibleDot.bind(this));
        super.registerUn(drawVisibleDotUn);

        const drawVisibleLineUn = gridCanvas.onDrawVisibleLine(this.handleDrawVisibleLine.bind(this));
        super.registerUn(drawVisibleLineUn);

        const sizeChangeUn = gridCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    private handleDrawVisibleDot(event: DrawGridDotEvent): void {
        const dot = event.dot;
        this.rasterDrawing.drawDot(dot);
    }

    private handleDrawVisibleLine(event: DrawGridLineEvent): void {
        const line = event.line;
        this.rasterDrawing.drawLine(line);
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
        this.rasterDrawing.size = size;
    }
}