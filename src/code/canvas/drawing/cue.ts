import { CanvasBase } from "../base.js";
import { CanvasSide, Id, SizeChangeEvent } from "../types.js";
import { IDrawingCanvas, IVectorDrawing, SvgDot, SvgLine } from "./types.js";
import {
    HoverDotEvent,
    DrawLinkEvent,
    UnhoverDotEvent,
    RemoveLinkEvent,
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
        const drawLinkUn = cueCanvas.onDrawLink(this.handleDrawLink.bind(this));
        super.registerUn(drawLinkUn);

        const removeLinkUn = cueCanvas.onRemoveLink(this.handleRemoveLink.bind(this));
        super.registerUn(removeLinkUn);

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

    private handleDotHovered(event: HoverDotEvent): void {
        const dot = event.dot;
        const id = dot.id;

        const svgDot = this.vectorDrawing.drawDot(dot);
        this.svgDots.set(id, svgDot);
    }

    private handleDotUnhovered(event: UnhoverDotEvent): void {
        const id = event.dot.id;

        if (this.svgDots.has(id)) {
            const svgDot = this.svgDots.get(id)!;
            this.vectorDrawing.removeDot(svgDot)
            this.svgDots.delete(id);
        }
    }

    private handleDrawLink(event: DrawLinkEvent): void {
        const link = event.link;
        const id = link.id;
        const side = link.side;

        const svgLine = side === CanvasSide.Front
            ? this.vectorDrawing.drawLine(link)
            : this.vectorDrawing.drawDashLine(link);

        this.svgLines.set(id, svgLine);
    }

    private handleRemoveLink(event: RemoveLinkEvent): void {
        const link = event.link;
        const id = link.id.toString();

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