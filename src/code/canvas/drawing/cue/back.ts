import { CueDrawingCanvasBase } from "./base.js";
import { CueSegment, Dot } from "../../types.js";
import { ICueCanvas } from "../../virtual/types.js";
import { ICueDrawingCanvas, IVectorDrawingCanvas, SvgDot, SvgLine } from "../types.js";


export class BackCueDrawingCanvas extends CueDrawingCanvasBase implements ICueDrawingCanvas {

    constructor(cueCanvas: ICueCanvas, vectorDrawing: IVectorDrawingCanvas) {
        super(BackCueDrawingCanvas.name, cueCanvas, vectorDrawing);
    }

    protected override drawDot(dot: Dot, radius: number, color: string): SvgDot {
        return this.vectorDrawing.drawDashDot(dot, radius, color);
    }

    protected override drawDashDot(dot: Dot, radius: number, color: string): SvgDot {
        return this.vectorDrawing.drawDot(dot, radius, color);
    }

    protected override drawLine(segment: CueSegment): SvgLine {
        return this.vectorDrawing.drawDashLine(segment);
    }

    protected override drawDashLine(segment: CueSegment): SvgLine {
        return this.vectorDrawing.drawLine(segment);
    }
}