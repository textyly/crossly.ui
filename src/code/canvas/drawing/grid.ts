import { CanvasBase } from "../base.js";
import { Id, SizeChangeEvent } from "../types.js";
import { IGridDrawingCanvas, IRasterDrawing, IVectorDrawing, SvgLine } from "./types.js";
import { DrawGridDotsEvent, DrawGridThreadsEvent, IGridCanvas } from "../virtual/types.js";

export class GridDrawingCanvas extends CanvasBase implements IGridDrawingCanvas {
    private readonly rasterDrawing: IRasterDrawing;
    private readonly vectorDrawing: IVectorDrawing;
    private readonly svgLines: Map<Id, SvgLine>;

    constructor(rasterDrawing: IRasterDrawing, vectorDrawing: IVectorDrawing) {
        super();
        this.rasterDrawing = rasterDrawing;
        this.vectorDrawing = vectorDrawing;
        this.svgLines = new Map<Id, SvgLine>();
    }

    public subscribe(gridCanvas: IGridCanvas): void {
        const drawVisibleDotsUn = gridCanvas.onDrawVisibleDots(this.handleDrawVisibleDots.bind(this));
        super.registerUn(drawVisibleDotsUn);

        const drawVisibleThreadsUn = gridCanvas.onDrawVisibleThreads(this.handleDrawVisibleThreads.bind(this));
        super.registerUn(drawVisibleThreadsUn);

        const redrawUn = gridCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const sizeChangeUn = gridCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawVisibleDots(event: DrawGridDotsEvent): void {
        const dots = event.dots;
        this.rasterDrawing.drawDots(dots);
    }

    private handleDrawVisibleThreads(event: DrawGridThreadsEvent): void {
        const threads = event.threads;

        threads.forEach((thread) => {
            const svgLine = this.vectorDrawing.drawLine(thread);
            this.svgLines.set(thread.id, svgLine);
        });
    }

    private handleRedraw(): void {
        this.clear();
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;

        this.rasterDrawing.size = size;
        this.vectorDrawing.size = size;
    }

    private clear(): void {
        this.rasterDrawing.clear();
        this.svgLines.forEach((line) => this.vectorDrawing.removeLine(line));
    }
}