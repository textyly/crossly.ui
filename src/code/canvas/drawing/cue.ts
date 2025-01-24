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
        const drawFrontLineUn = cueCanvas.onDrawFrontLine(this.handleDrawFrontLine.bind(this));
        super.registerUn(drawFrontLineUn);

        const removeFrontLineUn = cueCanvas.onRemoveFrontLine(this.handleRemoveLine.bind(this));
        super.registerUn(removeFrontLineUn);

        const drawBackLineUn = cueCanvas.onDrawBackLine(this.handleDrawBackLine.bind(this));
        super.registerUn(drawBackLineUn);

        const removeBackLineUn = cueCanvas.onRemoveBackLine(this.handleRemoveLine.bind(this));
        super.registerUn(removeBackLineUn);

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

    private handleDrawFrontLine(event: DrawCueLineEvent): void {
        const line = event.line;
        const id = line.id;

        const svgLine = this.vectorDrawing.drawLine(line);
        this.svgLines.set(id, svgLine);
    }

    private handleDrawBackLine(event: DrawCueLineEvent): void {
        const line = event.line;
        const id = line.id;

        const svgLine = this.vectorDrawing.drawDashLine(line);
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