import { CanvasBase } from "../../base.js";
import assert from "../../../asserts/assert.js";
import { Dot, Bounds, CueSegment } from "../../types.js";
import { IVectorDrawingCanvas, SvgDot, SvgLine } from "../types.js";

export class VectorDrawingCanvas extends CanvasBase implements IVectorDrawingCanvas {
    private readonly svgCanvas: HTMLElement;

    constructor(svgCanvas: HTMLElement) {
        super(VectorDrawingCanvas.name);

        this.svgCanvas = svgCanvas;
    }

    public drawDot(dot: Dot, radius: number, color: string): SvgDot {
        this.ensureAlive();

        assert.greaterThanZero(radius, "radius");
        assert.greaterThanZero(color.length, "color.length");

        const svgDot = this.drawDotCore(dot, radius, color);
        return svgDot;
    }

    public drawDashDot(dot: Dot, radius: number, color: string): SvgDot {
        this.ensureAlive();

        assert.greaterThanZero(radius, "radius");
        assert.greaterThanZero(color.length, "color.length");

        const svgDot = this.drawDashDotCore(dot, radius, color);
        return svgDot;
    }

    public removeDot(dot: SvgDot): void {
        this.ensureAlive();

        this.svgCanvas.removeChild(dot);
    }

    public drawLine(segment: CueSegment): SvgLine {
        this.ensureAlive();

        const svgLine = this.drawLineCore(segment);
        return svgLine;
    }

    public drawDashLine(segment: CueSegment): SvgLine {
        this.ensureAlive();

        const svgLine = this.drawDashLineCore(segment);
        return svgLine;
    }

    public removeLine(line: SvgLine): void {
        this.ensureAlive();

        this.svgCanvas.removeChild(line);
    }

    public moveLine(segment: CueSegment, svgLine: SvgLine): SvgLine {
        this.ensureAlive();

        assert.greaterThanZero(segment.width, "segment.width");
        assert.greaterThanZero(segment.color.length, "segment.color.length");

        this.moveLineCore(segment, svgLine);

        return svgLine;
    }

    protected override invokeBoundsChange(bounds: Bounds): void {
        super.invokeBoundsChange(bounds);

        const x = bounds.left.toString();
        const y = bounds.top.toString();
        const width = bounds.width.toString();
        const height = bounds.height.toString();

        this.svgCanvas.style.transform = `translate(${x}px, ${y}px)`;
        this.svgCanvas.setAttribute("width", width);
        this.svgCanvas.setAttribute("height", height);
    }

    private drawDotCore(dot: Dot, radius: number, color: string): SvgDot {
        const svgDot = this.createDot(dot, radius, color);
        this.svgCanvas.appendChild(svgDot);
        return svgDot;
    }

    private drawDashDotCore(dot: Dot, radius: number, color: string): SvgDot {
        const svgDot = this.createDot(dot, radius, color);
        const width = (radius / 3).toString();

        svgDot.setAttribute("fill", "none");
        svgDot.setAttribute("stroke-dasharray", "5,3");
        svgDot.setAttribute("stroke", color);
        svgDot.setAttribute("stroke-width", width);

        this.svgCanvas.appendChild(svgDot);
        return svgDot;
    }

    private drawLineCore(segment: CueSegment): SvgLine {
        const svgLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.moveLine(segment, svgLine);
        this.svgCanvas.appendChild(svgLine);
        return svgLine;
    }

    private drawDashLineCore(segment: CueSegment): SvgLine {
        const svgLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.moveLine(segment, svgLine);
        svgLine.setAttribute("stroke-dasharray", "5,3");
        this.svgCanvas.appendChild(svgLine);
        return svgLine;
    }

    private moveLineCore(segment: CueSegment, svgLine: SvgLine): SvgLine {
        const x1 = (segment.from.x - this.bounds.left).toString();
        const y1 = (segment.from.y - this.bounds.top).toString();

        const x2 = (segment.to.x - this.bounds.left).toString();
        const y2 = (segment.to.y - this.bounds.top).toString();

        const width = segment.width.toString();
        const color = segment.color;

        svgLine.setAttribute("x1", x1);
        svgLine.setAttribute('y1', y1);

        svgLine.setAttribute("x2", x2);
        svgLine.setAttribute("y2", y2);

        svgLine.setAttribute("stroke", color);
        svgLine.setAttribute("stroke-width", width);

        return svgLine;
    }

    private createDot(dot: Dot, radius: number, color: string): SvgDot {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        const cx = (dot.x - this.bounds.left).toString();
        const cy = (dot.y - this.bounds.top).toString();
        const r = (radius / 2).toString();

        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        circle.setAttribute("fill", color);

        return circle;
    }
}