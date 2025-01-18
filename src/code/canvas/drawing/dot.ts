import { Size } from "../types.js";
import { CanvasBase } from "../base.js";
import { DrawDotEvent, IDotVirtualCanvas } from "../virtual/types.js";
import { IRasterDrawing } from "./types.js";

export class DotCanvas extends CanvasBase {
    protected readonly rasterDrawing: IRasterDrawing;
    protected readonly dotVirtualCanvas: IDotVirtualCanvas;

    constructor(rasterDrawing: IRasterDrawing, dotVirtualCanvas: IDotVirtualCanvas) {
        super();
        this.rasterDrawing = rasterDrawing;
        this.dotVirtualCanvas = dotVirtualCanvas;
        this.subscribe();
    }

    private subscribe(): void {
        const drawDotUn = this.dotVirtualCanvas.onDrawDot(this.handleDrawDot.bind(this));
        super.registerUn(drawDotUn);

        const sizeChangedUn = this.dotVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangedUn);
    }

    private handleDrawDot(event: DrawDotEvent): void {
        const virtualDot = event.dot;
        this.rasterDrawing.drawDot(virtualDot);
    }

    private handleSizeChange(size: Size): void {
        super.size = size;
        this.rasterDrawing.size = size;
    }
}