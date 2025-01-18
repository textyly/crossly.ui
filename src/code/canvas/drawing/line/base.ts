import { Size } from "../../types.js";
import { CanvasBase } from "../../base.js";
import { RasterCanvas } from "../raster.js";
import {
    Line,
    DrawLineEvent,
    ILineVirtualCanvas
} from "../../virtual/types.js";

export abstract class LineCanvasBase extends CanvasBase {
    protected readonly rasterCanvas: RasterCanvas;
    protected readonly lineVirtualCanvas: ILineVirtualCanvas;

    constructor(rasterCanvas: RasterCanvas, lineVirtualCanvas: ILineVirtualCanvas) {
        super();

        this.rasterCanvas = rasterCanvas;
        this.lineVirtualCanvas = lineVirtualCanvas;

        this.subscribe();
    }

    private subscribe(): void {
        const drawLineUn = this.lineVirtualCanvas.onDrawLine(this.handleDrawLine.bind(this));
        super.registerUn(drawLineUn);
        const sizeChangedUn = this.lineVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangedUn);
    }

    protected abstract drawLine(line: Line): void;

    private handleDrawLine(event: DrawLineEvent): void {
        const line = event.line;
        this.drawLine(line);
    }

    private handleSizeChange(size: Size): void {
        super.size = size;
        this.rasterCanvas.size = size;
    }
}