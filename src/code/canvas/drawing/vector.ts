import { CanvasBase } from "../base.js";
import { Dot, Bounds, Thread } from "../types.js";
import { IVectorDrawing, SvgDot, SvgLine } from "./types.js";

export class VectorDrawing extends CanvasBase implements IVectorDrawing {
    private readonly svgCanvas: HTMLElement;

    constructor(svgCanvas: HTMLElement) {
        super();
        this.svgCanvas = svgCanvas;
    }

    public drawDot(dot: Dot): SvgDot {
        const svgDot = this.createDot(dot);
        this.svgCanvas.appendChild(svgDot);
        return svgDot;
    }

    public drawDashDot(dot: Dot): SvgDot {
        const svgDot = this.createDot(dot);
        const width = (dot.radius / 2).toString();

        svgDot.setAttribute("fill", "none");
        svgDot.setAttribute("stroke-dasharray", "5,1");
        svgDot.setAttribute("stroke", dot.color);
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

    private createDot(dot: Dot): SvgDot {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        const cx = dot.x.toString();
        const cy = dot.y.toString();
        const radius = dot.radius.toString();
        const color = dot.color;

        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", radius);
        circle.setAttribute("fill", color);

        return circle;
    }

    public override set bounds(value: Bounds) {
        super.bounds = value;
        console.log(`raster: ${JSON.stringify(value)}`);

        const x = value.x + "px";
        const y = value.y + "px";
        const width = value.width.toString();
        const height = value.height.toString();

        this.svgCanvas.style.left = x;
        this.svgCanvas.style.top = y;
        this.svgCanvas.setAttribute("width", width);
        this.svgCanvas.setAttribute("height", height);
    }
}