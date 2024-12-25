import { Canvas } from "../base.js";
import { Dot } from "../virtual/types.js";
import { SvgDot, SvgLine } from "./types.js";

export class SvgCanvas extends Canvas {
    private svgCanvas: HTMLElement;

    constructor(svgCanvas: HTMLElement) {
        super(svgCanvas.clientWidth, svgCanvas.clientHeight);

        this.svgCanvas = svgCanvas;
    }

    protected override initializeCore(): void {
        // do nothing
    }

    protected override disposeCore(): void {
        // do nothing
    }

    public drawDot(dot: Dot): SvgDot {
        const d = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const x = dot.x.toString();
        const y = dot.y.toString();
        const radius = dot.radius.toString();

        d.setAttribute("cx", x);
        d.setAttribute("cy", y.toString());
        d.setAttribute("r", radius);
        d.setAttribute("fill", "gray");

        this.svgCanvas.appendChild(d);

        return d;
    }

    public removeDot(dot: SvgDot): void {
        this.svgCanvas.removeChild(dot);
    }

    public drawLine(from: Dot, to: Dot): SvgLine {
        const line = this.drawLineCore(from, to);
        this.svgCanvas.appendChild(line);
        return line;
    }

    public drawDashLine(from: Dot, to: Dot): SvgLine {
        const line = this.drawLineCore(from, to);
        line.setAttribute("stroke-dasharray", "5,2");
        this.svgCanvas.appendChild(line);
        return line;
    }

    public removeLine(line: SvgLine): void {
        this.svgCanvas.removeChild(line);
    }

    private drawLineCore(from: Dot, to: Dot): SvgLine {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const x1 = from.x.toString();
        const y1 = from.y.toString();
        const x2 = to.x.toString();
        const y2 = to.y.toString();


        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);

        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);

        line.setAttribute('stroke', 'red');
        line.setAttribute('stroke-width', "2");

        return line;
    }
}