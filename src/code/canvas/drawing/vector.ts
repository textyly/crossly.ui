import { Size } from "../types.js";
import { CanvasBase } from "../base.js";
import { StitchDot, StitchLine } from "../types.js";
import { IVectorDrawing, SvgDot, SvgLine } from "./types.js";

export class VectorDrawing extends CanvasBase implements IVectorDrawing {
    private readonly svgCanvas: HTMLElement;

    constructor(svgCanvas: HTMLElement) {
        super();
        this.svgCanvas = svgCanvas;
    }

    public drawDot(dot: StitchDot): SvgDot {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.moveDot(dot, circle);
        this.svgCanvas.appendChild(circle);
        return circle;
    }

    public removeDot(dot: SvgDot): void {
        this.svgCanvas.removeChild(dot);
    }

    public drawLine(line: StitchLine): SvgLine {
        const svgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.moveLine(line, svgLine);
        this.svgCanvas.appendChild(svgLine);
        return svgLine;
    }

    public drawDashLine(line: StitchLine): SvgLine {
        const svgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.moveLine(line, svgLine);
        svgLine.setAttribute("stroke-dasharray", "5,2"); //TODO: !!!
        this.svgCanvas.appendChild(svgLine);
        return svgLine;
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

    public moveDot(dot: StitchDot, circle: SvgDot): SvgDot {
        const cx = dot.x.toString();
        const cy = dot.y.toString();
        const r = dot.radius.toString();

        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        circle.setAttribute("fill", dot.color);

        return circle;
    }

    public moveLine(line: StitchLine, svgLine: SvgLine): SvgLine {
        const x1 = line.from.x.toString();
        const y1 = line.from.y.toString();
        const x2 = line.to.x.toString();
        const y2 = line.to.y.toString();
        const width = line.width.toString();

        svgLine.setAttribute('x1', x1);
        svgLine.setAttribute('y1', y1);

        svgLine.setAttribute('x2', x2);
        svgLine.setAttribute('y2', y2);

        svgLine.setAttribute('stroke', line.color);
        svgLine.setAttribute('stroke-width', width);

        return svgLine;
    }
}