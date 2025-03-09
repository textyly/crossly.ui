import { Dot, ICanvas, Thread } from "../types.js";
import { DotArray } from "../utilities/arrays/dot/dot.js";
import { FabricThreadArray } from "../utilities/arrays/thread/fabric.js";
import { ICueCanvas, IFabricCanvas, IStitchCanvas } from "../virtual/types.js";

export type SvgDot = SVGCircleElement;
export type SvgLine = SVGLineElement;

export interface IDrawingCanvas extends ICanvas {
}

export interface IFabricDrawingCanvas extends IDrawingCanvas {
}

export interface IStitchDrawingCanvas extends IDrawingCanvas {
}

export interface ICueDrawingCanvas extends IDrawingCanvas {
}

export interface IRasterDrawingCanvas extends ICanvas {
    createBitMap(): Promise<ImageBitmap>;
    drawBitMap(bitmap: ImageBitmap): void;
    drawDots(dots: DotArray, radius: number, color: string): void;
    drawLines(thread: FabricThreadArray): void;
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