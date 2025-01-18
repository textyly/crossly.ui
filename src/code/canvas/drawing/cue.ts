import { CanvasBase } from "../base.js";
import { IDrawingCanvas, IVectorDrawing, SvgDot, SvgLine } from "./types.js";
import { Size } from "../types.js";
import {
    Id,
    CanvasSide,
    HoverDotEvent,
    UnhoverDotEvent,
    DrawLinkEvent,
    RemoveLinkEvent,
    ICueVirtualCanvas
} from "../virtual/types.js";

export class CueDrawingCanvas extends CanvasBase implements IDrawingCanvas<ICueVirtualCanvas> {
    private readonly vectorDrawing: IVectorDrawing;
    private readonly svgDots: Map<Id, SvgDot>;
    private readonly svgLines: Map<Id, SvgLine>;

    constructor(vectorDrawing: IVectorDrawing) {
        super();
        this.vectorDrawing = vectorDrawing;
        this.svgDots = new Map<Id, SvgDot>();
        this.svgLines = new Map<Id, SvgLine>();
    }

    public subscribe(cueVirtualCanvas: ICueVirtualCanvas): void {
        const drawLinkUn = cueVirtualCanvas.onDrawLink(this.handleDrawLink.bind(this));
        super.registerUn(drawLinkUn);

        const removeLinkUn = cueVirtualCanvas.onRemoveLink(this.handleRemoveLink.bind(this));
        super.registerUn(removeLinkUn);

        const dotHoveredUn = cueVirtualCanvas.onHoverDot(this.handleDotHovered.bind(this));
        super.registerUn(dotHoveredUn);

        const dotUnhoveredUn = cueVirtualCanvas.onUnhoverDot(this.handleDotUnhovered.bind(this));
        super.registerUn(dotUnhoveredUn);

        const sizeChangedUn = cueVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangedUn);
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
        const from = link.from;
        const to = link.to;
        const side = link.side;

        const svgLine = side === CanvasSide.Front
            ? this.vectorDrawing.drawLine(from, to)
            : this.vectorDrawing.drawDashLine(from, to);

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

    private handleSizeChange(size: Size): void {
        super.size = size;
        this.vectorDrawing.size = size;
    }
}