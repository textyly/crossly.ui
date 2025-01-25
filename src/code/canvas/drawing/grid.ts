import { CanvasBase } from "../base.js";
import { Id, SizeChangeEvent } from "../types.js";
import { IDrawingCanvas, IRasterDrawing, IVectorDrawing, SvgLine } from "./types.js";
import { DrawGridDotEvent, DrawGridLineEvent, IGridCanvas } from "../virtual/types.js";

export class GridDrawingCanvas extends CanvasBase implements IDrawingCanvas<IGridCanvas> {
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
        const drawVisibleDotUn = gridCanvas.onDrawVisibleDot(this.handleDrawVisibleDot.bind(this));
        super.registerUn(drawVisibleDotUn);

        const drawVisibleLineUn = gridCanvas.onDrawVisibleLine(this.handleDrawVisibleLine.bind(this));
        super.registerUn(drawVisibleLineUn);

        const redrawUn = gridCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const sizeChangeUn = gridCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    private handleDrawVisibleDot(event: DrawGridDotEvent): void {
        const dot = event.dot;
        this.rasterDrawing.drawDot(dot);
    }

    private handleDrawVisibleLine(event: DrawGridLineEvent): void {
        const line = event.line;
        const svgLine = this.vectorDrawing.drawLine(line);
        this.svgLines.set(line.id, svgLine);
    }

    private handleRedraw(): void {
        this.svgLines.forEach((line) => this.vectorDrawing.removeLine(line));
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;

        this.rasterDrawing.size = size;
        this.vectorDrawing.size = size;
    }
}