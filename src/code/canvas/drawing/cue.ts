import { CanvasBase } from "../base.js";
import { CanvasSide, Id, SizeChangeEvent } from "../types.js";
import { IDrawingCanvas, IVectorDrawing, SvgDot, SvgLine } from "./types.js";
import {
    HoverCueDotEvent,
    DrawCueLineEvent,
    UnhoverCueDotEvent,
    RemoveCueLineEvent,
    ICueCanvas
} from "../virtual/types.js";

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
        const drawLineUn = cueCanvas.onDrawLine(this.handleDrawLine.bind(this));
        super.registerUn(drawLineUn);

        const removeLineUn = cueCanvas.onRemoveLine(this.handleRemoveLine.bind(this));
        super.registerUn(removeLineUn);

        const dotHoveredUn = cueCanvas.onHoverDot(this.handleDotHovered.bind(this));
        super.registerUn(dotHoveredUn);

        const dotUnhoveredUn = cueCanvas.onUnhoverDot(this.handleDotUnhovered.bind(this));
        super.registerUn(dotUnhoveredUn);

        const sizeChangeUn = cueCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    public override dispose(): void {
        this.svgDots.clear();
        this.svgLines.clear();
        super.dispose();
    }

    private handleDotHovered(event: HoverCueDotEvent): void {
        const dot = event.dot;
        const id = dot.id;

        const svgDot = this.vectorDrawing.drawDot(dot);
        this.svgDots.set(id, svgDot);
    }

    private handleDotUnhovered(event: UnhoverCueDotEvent): void {
        const id = event.dot.id;

        if (this.svgDots.has(id)) {
            const svgDot = this.svgDots.get(id)!;
            this.vectorDrawing.removeDot(svgDot)
            this.svgDots.delete(id);
        }
    }

    private handleDrawLine(event: DrawCueLineEvent): void {
        const line = event.line;
        const id = line.id;
        const side = line.side;

        const svgLine = side === CanvasSide.Front
            ? this.vectorDrawing.drawLine(line)
            : this.vectorDrawing.drawDashLine(line);

        this.svgLines.set(id, svgLine);
    }

    private handleRemoveLine(event: RemoveCueLineEvent): void {
        const line = event.line;
        const id = line.id.toString();

        if (this.svgLines.has(id)) {
            const svgLine = this.svgLines.get(id)!;
            this.vectorDrawing.removeLine(svgLine);
            this.svgLines.delete(id);
        }
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
        this.vectorDrawing.size = size;
    }
}