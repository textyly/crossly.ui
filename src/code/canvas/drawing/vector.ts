import { CanvasBase } from "../base.js";
import { Dot, Size, Thread } from "../types.js";
import { IVectorDrawing, SvgDot, SvgLine } from "./types.js";

export class VectorDrawing extends CanvasBase implements IVectorDrawing {
    private readonly svgCanvas: HTMLElement;

    constructor(svgCanvas: HTMLElement) {
        super();
        this.svgCanvas = svgCanvas;
    }

    public drawDot(dot: Dot): SvgDot {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        const cx = dot.x.toString();
        const cy = dot.y.toString();
        const r = dot.radius.toString();

        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        circle.setAttribute("fill", dot.color);

        this.svgCanvas.appendChild(circle);
        return circle;
    }

    public removeDot(dot: SvgDot): void {
        this.svgCanvas.removeChild(dot);
    }

    public drawLine(thread: Thread<Dot>): SvgLine {
        const svgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.moveLine(thread, svgLine);
        this.svgCanvas.appendChild(svgLine);
        return svgLine;
    }

    public drawDashLine(thread: Thread<Dot>): SvgLine {
        const svgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.moveLine(thread, svgLine);
        svgLine.setAttribute("stroke-dasharray", "5,2"); //TODO: !!!
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

        svgLine.setAttribute('x1', x1);
        svgLine.setAttribute('y1', y1);

        svgLine.setAttribute('x2', x2);
        svgLine.setAttribute('y2', y2);

        svgLine.setAttribute('stroke', thread.color);
        svgLine.setAttribute('stroke-width', width);

        return svgLine;
    }

    public override set size(value: Size) {
        super.size = value;
        const width = value.width.toString();
        const height = value.height.toString();

        this.svgCanvas.setAttribute("width", width);
        this.svgCanvas.setAttribute("height", height);
    }
}