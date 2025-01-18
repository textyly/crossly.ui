import { CanvasBase } from "../base.js";
import { IVectorDrawing, SvgDot, SvgLine } from "./types.js";
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

export class CueCanvas extends CanvasBase {
    protected readonly vectorDrawing: IVectorDrawing;
    protected readonly cueVirtualCanvas: ICueVirtualCanvas;

    private readonly svgDots: Map<Id, SvgDot>;
    private readonly svgLines: Map<Id, SvgLine>;

    constructor(vectorDrawing: IVectorDrawing, cueVirtualCanvas: ICueVirtualCanvas) {
        super();

        this.vectorDrawing = vectorDrawing;
        this.cueVirtualCanvas = cueVirtualCanvas;

        this.svgDots = new Map<Id, SvgDot>();
        this.svgLines = new Map<Id, SvgLine>();

        this.subscribe();
    }

    private subscribe(): void {
        const drawLinkUn = this.cueVirtualCanvas.onDrawLink(this.handleDrawLink.bind(this));
        super.registerUn(drawLinkUn);

        const removeLinkUn = this.cueVirtualCanvas.onRemoveLink(this.handleRemoveLink.bind(this));
        super.registerUn(removeLinkUn);

        const dotHoveredUn = this.cueVirtualCanvas.onHoverDot(this.handleDotHovered.bind(this));
        super.registerUn(dotHoveredUn);

        const dotUnhoveredUn = this.cueVirtualCanvas.onUnhoverDot(this.handleDotUnhovered.bind(this));
        super.registerUn(dotUnhoveredUn);

        const sizeChangedUn = this.cueVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangedUn);
    }

    public override dispose(): void {
        this.svgDots.clear();
        this.svgLines.clear();
        super.dispose();
    }

    private handleDotHovered(event: HoverDotEvent): void {
        const virtualDot = event.dot;
        const id = virtualDot.id;

        const svgDot = this.vectorDrawing.drawDot(virtualDot);
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
        const virtualLink = event.link;
        const id = virtualLink.id;
        const from = virtualLink.from;
        const to = virtualLink.to;
        const side = virtualLink.side;

        const svgLine = side === CanvasSide.Front
            ? this.vectorDrawing.drawLine(from, to)
            : this.vectorDrawing.drawDashLine(from, to);

        this.svgLines.set(id, svgLine);
    }

    private handleRemoveLink(event: RemoveLinkEvent): void {
        const virtualLink = event.link;
        const id = virtualLink.id.toString();
        
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