import { CanvasBase } from "../base.js";
import { Id, BoundsChangeEvent } from "../types.js";
import { DrawGridDotsEvent, DrawGridThreadsEvent, IGridCanvas } from "../virtual/types.js";
import { IGridDrawingCanvas, IRasterDrawingCanvas, IVectorDrawingCanvas, SvgLine } from "./types.js";

export class GridDrawingCanvas extends CanvasBase implements IGridDrawingCanvas {
    private readonly rasterDrawing: IRasterDrawingCanvas;
    private readonly vectorDrawing: IVectorDrawingCanvas;

    private readonly svgLines: Map<Id, SvgLine>;

    constructor(rasterDrawing: IRasterDrawingCanvas, vectorDrawing: IVectorDrawingCanvas) {
        super();
        this.rasterDrawing = rasterDrawing;
        this.vectorDrawing = vectorDrawing;

        this.svgLines = new Map<Id, SvgLine>();
    }

    public subscribe(gridCanvas: IGridCanvas): void {
        const drawDotsUn = gridCanvas.onDrawDots(this.handleDrawDots.bind(this));
        super.registerUn(drawDotsUn);

        const drawThreadsUn = gridCanvas.onDrawThreads(this.handleDrawThreads.bind(this));
        super.registerUn(drawThreadsUn);

        const redrawUn = gridCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const boundsChangeUn = gridCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawDots(event: DrawGridDotsEvent): void {
        this.rasterDrawing.drawDots(event.dotsX, event.dotsY, event.dotRadius, event.dotColor);
    }

    private handleDrawThreads(event: DrawGridThreadsEvent): void {
        const threads = event.threads;
        this.rasterDrawing.drawLines(threads);
    }

    private handleRedraw(): void {
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        const bounds = event.bounds;
        super.bounds = bounds;

        this.rasterDrawing.bounds = bounds;
        this.vectorDrawing.bounds = bounds;
    }

    private clear(): void {
        this.rasterDrawing.clear();

        this.svgLines.forEach((line) => {
            this.vectorDrawing.removeLine(line);
        });
    }
}