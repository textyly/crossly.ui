import { Dot, ICanvas, Thread } from "../types.js";
import { ICueCanvas, IGridCanvas, IStitchCanvas } from "../virtual/types.js";

export type SvgDot = SVGCircleElement;
export type SvgLine = SVGLineElement;

export interface IDrawingCanvas<TCanvas> extends ICanvas {
    subscribe(canvas: TCanvas): void;
}

export interface IGridDrawingCanvas extends IDrawingCanvas<IGridCanvas> {
}

export interface IStitchDrawingCanvas extends IDrawingCanvas<IStitchCanvas> {
}

export interface ICueDrawingCanvas extends IDrawingCanvas<ICueCanvas> {
}

export interface IRasterDrawing extends ICanvas {
    drawDots(dots: Array<Dot>): void;
    drawLines(thread: Array<Thread<Dot>>): void;
    clear(): void;
}

export interface IVectorDrawing extends ICanvas {
    drawDot(dot: Dot): SvgDot;
    removeDot(dot: SvgDot): void;

    drawLine(thread: Thread<Dot>): SvgLine;
    drawDashLine(thread: Thread<Dot>): SvgLine;
    moveLine(thread: Thread<Dot>, svgLine: SvgLine): void;
    removeLine(thread: SvgLine): void;
}