import { ICanvas } from "../types.js";
import { Dot, Line } from "../virtual/types.js";

export type SvgDot = SVGCircleElement;
export type SvgLine = SVGLineElement;

export interface IRasterDrawing extends ICanvas {
    drawDot(dot: Dot): void;
    drawLine(line: Line): void;
    clear(): void;
}

export interface IVectorDrawing extends ICanvas {
    drawDot(dot: Dot): SvgDot;
    removeDot(dot: SvgDot): void;

    drawLine(from: Dot, to: Dot): SvgLine;
    drawDashLine(from: Dot, to: Dot): SvgLine;
    removeLine(line: SvgLine): void;
}