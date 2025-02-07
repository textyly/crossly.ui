import { Dot, ICanvas, Id, Thread } from "../types.js";
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

export interface IRasterDrawingCanvas extends ICanvas {
    drawDots(dots: Array<Dot>, radius: number, color: string): void;
    drawLines(threads: Array<Thread<Dot>>): void;
    clear(): void;
}

export interface IVectorDrawingCanvas extends ICanvas {
    drawDot(dot: Dot, radius: number, color: string): SvgDot;
    drawDashDot(dot: Dot, radius: number, color: string): SvgDot;
    removeDot(dot: SvgDot): void;

    drawLine(thread: Thread<Dot>): SvgLine;
    drawDashLine(thread: Thread<Dot>): SvgLine;
    moveLine(thread: Thread<Dot>, svgLine: SvgLine): void;
    removeLine(thread: SvgLine): void;
}

export interface IRasterVirtualDrawingCanvas extends IRasterDrawingCanvas {
}

export interface IVectorVirtualDrawingCanvas extends ICanvas {
    drawDot(dot: Dot, radius: number, color: string): void;
    drawDashDot(dot: Dot, radius: number, color: string): void;
    removeDot(id: Id): void;

    drawLine(id: Id, thread: Thread<Dot>): void;
    drawDashLine(id: Id, thread: Thread<Dot>): void;
    moveLine(id: Id, thread: Thread<Dot>): void;
    removeLine(id: Id): void;
}