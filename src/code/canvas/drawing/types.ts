import { Dot, ICanvas, Thread } from "../types.js";
import { ICueCanvas, IFabricCanvas, IStitchCanvas } from "../virtual/types.js";

export type SvgDot = SVGCircleElement;
export type SvgLine = SVGLineElement;

export interface IDrawingCanvas<TCanvas> extends ICanvas {
    subscribe(canvas: TCanvas): void;
}

export interface IFabricDrawingCanvas extends IDrawingCanvas<IFabricCanvas> {
}

export interface IStitchDrawingCanvas extends IDrawingCanvas<IStitchCanvas> {
}

export interface ICueDrawingCanvas extends IDrawingCanvas<ICueCanvas> {
}

export interface IRasterDrawingCanvas extends ICanvas {
    drawDots(dotsX: Array<number>, dotsY: Array<number>, radius: number, color: string): void;
    drawLines(included: Array<boolean>, fromDotsX: Array<number>, fromDotsY: Array<number>, toDotsX: Array<number>, toDotsY: Array<number>, width: Array<number>, colors: Array<string>): void;
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