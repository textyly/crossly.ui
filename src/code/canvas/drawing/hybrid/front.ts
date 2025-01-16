import { HybridCanvasBase } from "./base.js";
import { RasterCanvas } from "../raster/raster.js";
import { CanvasSide, ILineVirtualCanvas, Line } from "../../virtual/types.js";

export class FrontHybridCanvas extends HybridCanvasBase {
    constructor(rasterCanvas: RasterCanvas, lineVirtualCanvas: ILineVirtualCanvas) {
        super(rasterCanvas, lineVirtualCanvas);
    }

    override drawLine(line: Line): void {
        if (line.side === CanvasSide.Back) {
            return; // ignore back lines
        }
        this.rasterCanvas.drawLine(line);
    }
}