import { CanvasBase } from "../base.js";
import { Dot, Bounds, CueThread } from "../types.js";
import { IVectorDrawingCanvas, SvgDot, SvgLine } from "./types.js";

export class VectorDrawingCanvas extends CanvasBase implements IVectorDrawingCanvas {
    private readonly svgCanvas: HTMLElement;

    constructor(svgCanvas: HTMLElement) {
        super();
        this.svgCanvas = svgCanvas;
    }

    public drawDot(dot: Dot, radius: number, color: string): SvgDot {
        const svgDot = this.createDot(dot, radius, color);
        this.svgCanvas.appendChild(svgDot);
        return svgDot;
    }

    public drawDashDot(dot: Dot, radius: number, color: string): SvgDot {
        const svgDot = this.createDot(dot, radius, color);
        const width = (radius / 3).toString();

        svgDot.setAttribute("fill", "none");
        svgDot.setAttribute("stroke-dasharray", "5,3"); // TODO: config
        svgDot.setAttribute("stroke", color);
        svgDot.setAttribute("stroke-width", width);

        this.svgCanvas.appendChild(svgDot);
        return svgDot;
    }

    public removeDot(dot: SvgDot): void {
        this.svgCanvas.removeChild(dot);
    }

    public drawLine(thread: CueThread): SvgLine {
        const svgLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.moveLine(thread, svgLine);
        this.svgCanvas.appendChild(svgLine);
        return svgLine;
    }

    public drawDashLine(thread: CueThread): SvgLine {
        const svgLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.moveLine(thread, svgLine);
        svgLine.setAttribute("stroke-dasharray", "5,3"); //TODO: move it to the config!!!
        this.svgCanvas.appendChild(svgLine);
        return svgLine;
    }

    public removeLine(line: SvgLine): void {
        this.svgCanvas.removeChild(line);
    }

    public moveLine(thread: CueThread, svgLine: SvgLine): SvgLine {
        const x1 = (thread.from.x - this.bounds.left).toString();
        const y1 = (thread.from.y - this.bounds.top).toString();

        const x2 = (thread.to.x - this.bounds.left).toString();
        const y2 = (thread.to.y - this.bounds.top).toString();

        const width = thread.width.toString();
        const color = thread.color;

        svgLine.setAttribute("x1", x1);
        svgLine.setAttribute('y1', y1);

        svgLine.setAttribute("x2", x2);
        svgLine.setAttribute("y2", y2);

        svgLine.setAttribute("stroke", color);
        svgLine.setAttribute("stroke-width", width);

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