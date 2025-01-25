import { CanvasBase } from "../base.js";
import { Id, SizeChangeEvent } from "../types.js";
import { IDrawingCanvas, IVectorDrawing, SvgDot, SvgLine } from "./types.js";
import { DrawCueDotEvent, DrawCueLineEvent, ICueCanvas, RemoveCueDotEvent, RemoveCueLineEvent } from "../virtual/types.js";

export class CueDrawingCanvas extends CanvasBase implements IDrawingCanvas<ICueCanvas> {
    private readonly vectorDrawing: IVectorDrawing;
    private readonly svgDots: Map<Id, SvgDot>;
    private readonly svgLines: Map<Id, SvgLine>;

    constructor(vectorDrawing: IVectorDrawing) {
        super();
        this.vectorDrawing = vectorDrawing;
        this.svgDots = new Map<Id, SvgDot>();
        this.svgLines = new Map<Id, SvgLine>();
    }

    public subscribe(cueCanvas: ICueCanvas): void {
        const drawDotUn = cueCanvas.onDrawDot(this.handleDrawDot.bind(this));
        super.registerUn(drawDotUn);

        const removeDotUn = cueCanvas.onRemoveDot(this.handleRemoveDot.bind(this));
        super.registerUn(removeDotUn);

        const drawLineUn = cueCanvas.onDrawLine(this.handleDrawLine.bind(this));
        super.registerUn(drawLineUn);

        const drawDashLineUn = cueCanvas.onDrawDashLine(this.handleDrawDashLine.bind(this));
        super.registerUn(drawDashLineUn);

        const moveLineUn = cueCanvas.onMoveLine(this.handleMoveLine.bind(this));
        super.registerUn(moveLineUn);

        const removeLineUn = cueCanvas.onRemoveLine(this.handleRemoveLine.bind(this));
        super.registerUn(removeLineUn);

        const redrawUn = cueCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const sizeChangeUn = cueCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawDot(event: DrawCueDotEvent): void {
        const dot = event.dot;
        const id = dot.id;

        const svgDot = this.vectorDrawing.drawDot(dot);
        this.svgDots.set(id, svgDot);
    }

    private handleRemoveDot(event: RemoveCueDotEvent): void {
        const dot = event.dot;
        const id = dot.id;
        if (this.svgDots.has(id)) {
            const svgDot = this.svgDots.get(id);
            this.vectorDrawing.removeDot(svgDot!);
            this.svgDots.delete(id);
        }
    }

    private handleDrawLine(event: DrawCueLineEvent): void {
        const line = event.line;
        const id = line.id;

        const svgLine = this.vectorDrawing.drawLine(line);
        this.svgLines.set(id, svgLine);
    }

    private handleMoveLine(event: DrawCueLineEvent): void {
        const line = event.line;
        const id = line.id;

        if (this.svgLines.has(id)) {
            const svgLine = this.svgLines.get(id);
            this.vectorDrawing.moveLine(line, svgLine!);
        }
    }

    private handleDrawDashLine(event: DrawCueLineEvent): void {
        const line = event.line;
        const id = line.id;

        const svgLine = this.vectorDrawing.drawDashLine(line);
        this.svgLines.set(id, svgLine);
    }

    private handleRemoveLine(event: RemoveCueLineEvent): void {
        const line = event.line;
        const id = line.id;
        if (this.svgLines.has(id)) {
            const svgLine = this.svgLines.get(id);
            this.vectorDrawing.removeLine(svgLine!);
            this.svgLines.delete(id);
        }
    }

    private handleRedraw(): void {
        this.svgDots.forEach((dot) => this.vectorDrawing.removeDot(dot));
        this.svgLines.forEach((line) => this.vectorDrawing.removeLine(line));
        this.clear();
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
        this.vectorDrawing.size = size;
    }

    private clear(): void {
        this.svgDots.clear();
        this.svgLines.clear();
    }
}