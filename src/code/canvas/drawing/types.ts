import { Dot, ICanvas, Line } from "../types.js";

export type SvgDot = SVGCircleElement;
export type SvgLine = SVGLineElement;

export interface IDrawingCanvas<TCanvas> extends ICanvas {
    subscribe(canvas: TCanvas): void;
}

export interface IRasterDrawing extends ICanvas {
    drawDot(dot: Dot): void;
    drawLine(line: Line<Dot>): void;
    clear(): void;
}

export interface IVectorDrawing extends ICanvas {
    drawDot(dot: Dot): SvgDot;
    moveDot(dot: Dot, svgDot: SvgDot): void;
    removeDot(dot: SvgDot): void;

    drawLine(line: Line<Dot>): SvgLine;
    drawDashLine(line: Line<Dot>): SvgLine;
    moveLine(line: Line<Dot>, svgLine: SvgLine): void;
    removeLine(line: SvgLine): void;
}