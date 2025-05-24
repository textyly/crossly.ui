import { Density } from "../virtual/types.js";
import { IFabricDotArray } from "../utilities/arrays/types.js";
import { FabricThreadArray } from "../utilities/arrays/thread/fabric.js";
import { CueSegment, Dot, ICanvas, StitchPattern, StitchSegment } from "../types.js";

export type SvgDot = SVGCircleElement;
export type SvgLine = SVGLineElement;

export interface IShapeDrawing {
    draw(path: Path2D, fromX: number, fromY: number, toX: number, toY: number, width: number): void;
}

export interface IRasterDrawingCanvas extends ICanvas {
    createBitMap(): Promise<ImageBitmap>;
    drawBitMap(bitmap: ImageBitmap): void;
    clear(): void;
}

export interface IFabricRasterDrawingCanvas extends IRasterDrawingCanvas {
    drawDots(dots: IFabricDotArray): void;
    drawLines(threads: FabricThreadArray): void;
}

export interface IStitchRasterDrawingCanvas extends IRasterDrawingCanvas {
    drawLine(segment: StitchSegment, density: Density): void;
    drawLines(pattern: StitchPattern, density: Density): void;
}

export interface IVectorDrawingCanvas extends ICanvas {
    drawDot(dot: Dot, radius: number, color: string): SvgDot;
    drawDashDot(dot: Dot, radius: number, color: string): SvgDot;
    removeDot(dot: SvgDot): void;

    drawLine(segment: CueSegment): SvgLine;
    drawDashLine(segment: CueSegment): SvgLine;
    moveLine(segment: CueSegment, svgLine: SvgLine): void;
    removeLine(segment: SvgLine): void;
}

export interface IDrawingCanvas extends ICanvas {
}

export interface IFabricDrawingCanvas extends IDrawingCanvas {
}

export interface IStitchDrawingCanvas extends IDrawingCanvas {
}

export interface ICueDrawingCanvas extends IDrawingCanvas {
}