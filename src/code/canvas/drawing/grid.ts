import { CanvasBase } from "../base.js";
import { SizeChangeEvent } from "../types.js";
import { IDrawingCanvas, IRasterDrawing } from "./types.js";
import { DrawDotEvent, IGridCanvas } from "../virtual/types.js";

export class GirdDrawingCanvas extends CanvasBase implements IDrawingCanvas<IGridCanvas> {
    private readonly rasterDrawing: IRasterDrawing;

    constructor(rasterDrawing: IRasterDrawing) {
        super();
        this.rasterDrawing = rasterDrawing;
    }

    public subscribe(dotVirtualCanvas: IGridCanvas): void {
        const drawDotUn = dotVirtualCanvas.onDrawDot(this.handleDrawDot.bind(this));
        super.registerUn(drawDotUn);

        const sizeChangeUn = dotVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    private handleDrawDot(event: DrawDotEvent): void {
        const dot = event.dot;
        this.rasterDrawing.drawDot(dot);
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
        this.rasterDrawing.size = size;
    }
}