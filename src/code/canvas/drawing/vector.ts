import { CanvasBase } from "../base.js";
import { Dot, Bounds, Thread } from "../types.js";
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
        const width = (radius / 2).toString();

        svgDot.setAttribute("fill", "none");
        svgDot.setAttribute("stroke-dasharray", "5,1");
        svgDot.setAttribute("stroke", color);
        svgDot.setAttribute("stroke-width", width);

        this.svgCanvas.appendChild(svgDot);
        return svgDot;
    }

    public removeDot(dot: SvgDot): void {
        this.svgCanvas.removeChild(dot);
    }

    public drawLine(thread: Thread<Dot>): SvgLine {
        const svgLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.moveLine(thread, svgLine);
        this.svgCanvas.appendChild(svgLine);
        return svgLine;
    }

    public drawDashLine(thread: Thread<Dot>): SvgLine {
        const svgLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.moveLine(thread, svgLine);
        svgLine.setAttribute("stroke-dasharray", "5,2"); //TODO: move it to the config!!!
        this.svgCanvas.appendChild(svgLine);
        return svgLine;
    }

    public removeLine(line: SvgLine): void {
        this.svgCanvas.removeChild(line);
    }

    public moveLine(thread: Thread<Dot>, svgLine: SvgLine): SvgLine {
        const x1 = thread.from.x.toString();
        const y1 = thread.from.y.toString();

        const x2 = thread.to.x.toString();
        const y2 = thread.to.y.toString();

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

        const x = bounds.x.toString();
        const y = bounds.y.toString();
        const width = bounds.width.toString();
        const height = bounds.height.toString();

        this.svgCanvas.style.transform = `translate(${x}px, ${y}px, ${width}px, ${height}px)`;
        this.svgCanvas.setAttribute("width", width);
        this.svgCanvas.setAttribute("height", height);
    }

    private createDot(dot: Dot, radius: number, color: string): SvgDot {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        const cx = dot.x.toString();
        const cy = dot.y.toString();
        const r = radius.toString();

        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        circle.setAttribute("fill", color);

        return circle;
    }
}