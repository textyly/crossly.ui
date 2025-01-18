import { LineCanvasBase } from "./base.js";
import { RasterCanvas } from "../raster.js";
import { CanvasSide, ILineVirtualCanvas, Line } from "../../virtual/types.js";

export class FrontLineCanvas extends LineCanvasBase {
    constructor(rasterCanvas: RasterCanvas, lineVirtualCanvas: ILineVirtualCanvas) {
        super(rasterCanvas, lineVirtualCanvas);
    }

    protected override drawLine(line: Line): void {
        if (line.side === CanvasSide.Back) {
            return; // ignore back lines
        }
        this.rasterCanvas.drawLine(line);
    }
}