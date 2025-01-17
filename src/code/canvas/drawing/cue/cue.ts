import { CanvasBase } from "../../base.js";
import { SvgCanvas } from "../svg/svg.js";
import { SvgDot, SvgLine } from "../types.js";
import { Size } from "../../types.js";
import {
    Id,
    CanvasSide,
    HoverDotEvent,
    UnhoverDotEvent,
    DrawLinkEvent,
    RemoveLinkEvent,
    ICueVirtualCanvas
} from "../../virtual/types.js";

export class CueCanvas extends CanvasBase {
    protected readonly svgCanvas: SvgCanvas;
    protected readonly cueVirtualCanvas: ICueVirtualCanvas;

    private readonly dots: Map<Id, SvgDot>;
    private readonly lines: Map<Id, SvgLine>;

    constructor(svgCanvas: SvgCanvas, cueVirtualCanvas: ICueVirtualCanvas) {
        super();

        this.svgCanvas = svgCanvas;
        this.cueVirtualCanvas = cueVirtualCanvas;
        
        this.dots = new Map<Id, SvgDot>();
        this.lines = new Map<Id, SvgLine>();

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
        this.dots.clear();
        this.lines.clear();
        super.dispose();
    }

    private handleDotHovered(event: HoverDotEvent): void {
        const dot = event.dot;
        const id = dot.id;

        const svgDot = this.svgCanvas.drawDot(dot);
        this.dots.set(id, svgDot);
    }

    private handleDotUnhovered(event: UnhoverDotEvent): void {
        const dotId = event.dot.id;
        if (this.dots.has(dotId)) {
            const dot = this.dots.get(dotId)!;
            this.svgCanvas.removeDot(dot)
            this.dots.delete(dotId);
        }
    }

    private handleDrawLink(event: DrawLinkEvent): void {
        const id = event.link.id;
        const from = event.link.from;
        const to = event.link.to;
        const side = event.link.side;

        const svgLine = side === CanvasSide.Front
            ? this.svgCanvas.drawLine(from, to)
            : this.svgCanvas.drawDashLine(from, to);

        this.lines.set(id, svgLine);
    }

    private handleRemoveLink(even: RemoveLinkEvent): void {
        const lineId = even.link.id.toString();
        if (this.lines.has(lineId)) {
            const line = this.lines.get(lineId)!;
            this.svgCanvas.removeLine(line);
            this.lines.delete(lineId);
        }
    }

    private handleSizeChange(size: Size): void {
        super.size = size;
        this.svgCanvas.size = size;
    }
}