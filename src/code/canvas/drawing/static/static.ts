import { Size } from "../../types.js";
import { CanvasBase } from "../../base.js";
import { RasterCanvas } from "../raster/raster.js";
import { DrawDotEvent, IDotVirtualCanvas } from "../../virtual/types.js";

export class StaticCanvas extends CanvasBase {
    protected readonly rasterCanvas: RasterCanvas;
    protected readonly dotVirtualCanvas: IDotVirtualCanvas;

    constructor(rasterCanvas: RasterCanvas, dotVirtualCanvas: IDotVirtualCanvas) {
        super();

        this.rasterCanvas = rasterCanvas;
        this.dotVirtualCanvas = dotVirtualCanvas;
    }

    protected override initializeCore(): void {
        const drawDotUn = this.dotVirtualCanvas.onDrawDot(this.handleDrawDot.bind(this));
        super.registerUn(drawDotUn);

        const sizeChangedUn = this.dotVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangedUn);
    }

    protected override sizeChangeCore(): void {
        this.rasterCanvas.size = super.size;
    }

    protected override disposeCore(): void {
        // base class will unsubscribe handleDrawGrid and handleDrawLine
    }

    private handleDrawDot(event: DrawDotEvent): void {
        const dot = event.dot;
        this.rasterCanvas.drawDot(dot);
    }

    private handleSizeChange(size: Size): void {
        super.size = size;
    }
}