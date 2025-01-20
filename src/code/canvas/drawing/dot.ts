import { Size } from "../types.js";
import { CanvasBase } from "../base.js";
import { IDrawingCanvas, IRasterDrawing } from "./types.js";
import { DrawDotEvent, IDotVirtualCanvas } from "../virtual/types.js";

export class DotDrawingCanvas extends CanvasBase implements IDrawingCanvas<IDotVirtualCanvas> {
    private readonly rasterDrawing: IRasterDrawing;

    constructor(rasterDrawing: IRasterDrawing) {
        super();
        this.rasterDrawing = rasterDrawing;
    }

    public subscribe(dotVirtualCanvas: IDotVirtualCanvas): void {
        const drawDotUn = dotVirtualCanvas.onDrawDot(this.handleDrawDot.bind(this));
        super.registerUn(drawDotUn);

        const sizeChangedUn = dotVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangedUn);
    }

    private handleDrawDot(event: DrawDotEvent): void {
        const dot = event.dot;
        this.rasterDrawing.drawDot(dot);
    }

    private handleSizeChange(size: Size): void {
        super.size = size;
        this.rasterDrawing.size = size;
    }
}