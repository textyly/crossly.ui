import { HybridCanvasBase } from "./base.js";
import { RasterCanvas } from "../raster/raster.js";
import { CanvasSide, ILineVirtualCanvas, Line } from "../../virtual/types.js";

export class BackHybridCanvas extends HybridCanvasBase {
    constructor(rasterCanvas: RasterCanvas, lineVirtualCanvas: ILineVirtualCanvas) {
        super(rasterCanvas, lineVirtualCanvas);
    }

    override drawLine(line: Line): void {
        if (line.side === CanvasSide.Front) {
            return; // ignore front lines
        }
        this.rasterCanvas.drawLine(line);
    }
}