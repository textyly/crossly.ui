import { Size } from "../types.js";
import { CanvasBase } from "../base.js";
import { IRasterDrawing } from "./types.js";
import { DrawLineEvent, ILineVirtualCanvas } from "../virtual/types.js";

export class LineCanvas extends CanvasBase {
    protected readonly rasterDrawing: IRasterDrawing;
    protected readonly lineVirtualCanvas: ILineVirtualCanvas;

    constructor(rasterDrawing: IRasterDrawing, lineVirtualCanvas: ILineVirtualCanvas) {
        super();
        this.rasterDrawing = rasterDrawing;
        this.lineVirtualCanvas = lineVirtualCanvas;
        this.subscribe();
    }

    private subscribe(): void {
        const drawLineUn = this.lineVirtualCanvas.onDrawLine(this.handleDrawLine.bind(this));
        super.registerUn(drawLineUn);
        const sizeChangedUn = this.lineVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangedUn);
    }

    private handleDrawLine(event: DrawLineEvent): void {
        const virtualLine = event.line;
        this.rasterDrawing.drawLine(virtualLine);
    }

    private handleSizeChange(size: Size): void {
        super.size = size;
        this.rasterDrawing.size = size;
    }
}