import { Dot } from "../virtual/types.js";
import { IVectorDrawing, SvgDot, SvgLine } from "./types.js";
import { CanvasBase } from "../base.js";
import { Size } from "../types.js";

export class VectorDrawing extends CanvasBase implements IVectorDrawing {
    private readonly svgCanvas: HTMLElement;

    constructor(svgCanvas: HTMLElement) {
        super();
        this.svgCanvas = svgCanvas;
    }

    public drawDot(dot: Dot): SvgDot {
        const circle = this.createCircle(dot);
        this.svgCanvas.appendChild(circle);
        return circle;
    }

    public removeDot(dot: SvgDot): void {
        this.svgCanvas.removeChild(dot);
    }

    public drawLine(from: Dot, to: Dot): SvgLine {
        const line = this.createLine(from, to);
        this.svgCanvas.appendChild(line);
        return line;
    }

    public drawDashLine(from: Dot, to: Dot): SvgLine {
        const line = this.createLine(from, to);
        line.setAttribute("stroke-dasharray", "5,2");
        this.svgCanvas.appendChild(line);
        return line;
    }

    public removeLine(line: SvgLine): void {
        this.svgCanvas.removeChild(line);
    }

    public override set size(value: Size) {
        super.size = value;
        const width = value.width.toString();
        const height = value.height.toString();

        this.svgCanvas.setAttribute("width", width);
        this.svgCanvas.setAttribute("height", height);
    }

    private createCircle(dot: Dot): SVGCircleElement {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        const cx = dot.x.toString();
        const cy = dot.y.toString();
        const r = dot.radius.toString();

        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        circle.setAttribute("fill", "gray"); //TODO: line prop

        return circle;
    }

    private createLine(from: Dot, to: Dot): SvgLine {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

        const x1 = from.x.toString();
        const y1 = from.y.toString();
        const x2 = to.x.toString();
        const y2 = to.y.toString();

        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);

        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);

        line.setAttribute('stroke', 'red'); //TODO: dot prop
        line.setAttribute('stroke-width', "2"); //TODO: dot prop

        return line;
    }
}