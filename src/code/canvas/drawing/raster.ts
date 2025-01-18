import { CanvasBase } from "../base.js";
import { Size } from "../types.js";
import { Dot, Line } from "../virtual/types.js";
import { IRasterDrawing } from "./types.js";

export class RasterDrawing extends CanvasBase implements IRasterDrawing {
    private readonly rasterContext: CanvasRenderingContext2D;

    constructor(private rasterCanvas: HTMLCanvasElement) {
        super();

        this.rasterContext = rasterCanvas.getContext("2d")!;
    }

    public clear(): void {
        this.rasterContext.clearRect(0, 0, this.rasterCanvas.clientWidth, this.rasterCanvas.clientWidth);
    }

    public drawDot(dot: Dot): void {
        this.rasterContext.fillStyle = "gray";

        this.rasterContext.beginPath();
        this.rasterContext.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2); // TODO: 2 ???
        this.rasterContext.fill();
        this.rasterContext.closePath();
    }

    // TODO: lines must be in different raster canvas so that undo operation is more efficient
    public drawLine(line: Line): void {
        this.rasterContext.beginPath();

        const from = line.from;
        this.rasterContext.moveTo(from.x, from.y);

        const to = line.to;
        this.rasterContext.lineTo(to.x, to.y);

        this.rasterContext.lineWidth = line.from.radius;
        this.rasterContext.strokeStyle = "gray";
        this.rasterContext.stroke();
    }

    public override set size(value: Size) {
        super.size = value;
        this.rasterCanvas.width = value.width;
        this.rasterCanvas.height = value.height;
    }
}