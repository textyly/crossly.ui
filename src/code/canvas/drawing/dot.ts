import { CanvasBase } from "../base.js";
import { SizeChangeEvent } from "../types.js";
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