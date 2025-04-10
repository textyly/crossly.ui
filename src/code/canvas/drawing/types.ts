import { Density } from "../virtual/types.js";
import { DotArray } from "../utilities/arrays/dot/dot.js";
import { FabricThread } from "../utilities/arrays/thread/fabric.js";
import { CueThread, Dot, ICanvas, StitchPattern, StitchSegment } from "../types.js";

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
    drawDots(dots: DotArray): void;
    drawLines(threads: FabricThread): void;
}

export interface IStitchRasterDrawingCanvas extends IRasterDrawingCanvas {
    drawLine(segment: StitchSegment, density: Density): void;
    drawLines(pattern: StitchPattern, density: Density): void;
}

export interface IVectorDrawingCanvas extends ICanvas {
    drawDot(dot: Dot, radius: number, color: string): SvgDot;
    drawDashDot(dot: Dot, radius: number, color: string): SvgDot;
    removeDot(dot: SvgDot): void;

    drawLine(thread: CueThread): SvgLine;
    drawDashLine(thread: CueThread): SvgLine;
    moveLine(thread: CueThread, svgLine: SvgLine): void;
    removeLine(thread: SvgLine): void;
}

export interface IDrawingCanvas extends ICanvas {
}

export interface IFabricDrawingCanvas extends IDrawingCanvas {
}

export interface IStitchDrawingCanvas extends IDrawingCanvas {
}

export interface ICueDrawingCanvas extends IDrawingCanvas {
}