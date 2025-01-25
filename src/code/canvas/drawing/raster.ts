import { Size } from "../types.js";
import { CanvasBase } from "../base.js";
import { IRasterDrawing } from "./types.js";
import { StitchDot, StitchLine } from "../types.js";

export class RasterDrawing extends CanvasBase implements IRasterDrawing {
    private readonly rasterContext: CanvasRenderingContext2D;

    constructor(private rasterCanvas: HTMLCanvasElement) {
        super();
        this.rasterContext = rasterCanvas.getContext("2d")!;
    }

    public drawDot(dot: StitchDot): void {
        this.rasterContext.fillStyle = dot.color;

        this.rasterContext.beginPath();
        this.rasterContext.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        this.rasterContext.fill();
        this.rasterContext.closePath();
    }

    public drawLine(line: StitchLine): void {
        this.rasterContext.beginPath();

        const from = line.from;
        this.rasterContext.moveTo(from.x, from.y);

        const to = line.to;
        this.rasterContext.lineTo(to.x, to.y);

        this.rasterContext.lineWidth = line.width;
        this.rasterContext.strokeStyle = line.color;
        this.rasterContext.stroke();
    }

    public clear(): void {
        this.rasterContext.clearRect(0, 0, this.rasterCanvas.clientWidth, this.rasterCanvas.clientWidth);
    }

    public override set size(value: Size) {
        super.size = value;
        this.rasterCanvas.width = value.width;
        this.rasterCanvas.height = value.height;
    }
}