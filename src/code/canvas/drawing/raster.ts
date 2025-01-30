import { CanvasBase } from "../base.js";
import { IRasterDrawing } from "./types.js";
import { Dot, Size, Thread } from "../types.js";

export class RasterDrawing extends CanvasBase implements IRasterDrawing {
    private readonly context: CanvasRenderingContext2D;

    constructor(private rasterCanvas: HTMLCanvasElement) {
        super();
        this.context = rasterCanvas.getContext("2d")!;
    }

    public drawDots(dots: Array<Dot>): void {
        this.context.beginPath();

        dots.forEach((dot) => {
            this.context.fillStyle = dot.color;

            this.context.moveTo(dot.x, dot.y);
            this.context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        });

        this.context.fill();
    }

    public drawLines(threads: Array<Thread<Dot>>): void {
        this.context.beginPath();

        threads.forEach((thread) => {
            this.context.lineWidth = thread.width;
            this.context.strokeStyle = thread.color;

            const from = thread.from;
            this.context.moveTo(from.x, from.y);

            const to = thread.to;
            this.context.lineTo(to.x, to.y);
        });

        this.context.stroke();
    }

    public clear(): void {
        this.context.clearRect(0, 0, this.rasterCanvas.clientWidth, this.rasterCanvas.clientWidth);
    }

    public override set size(value: Size) {
        super.size = value;
        this.rasterCanvas.width = value.width;
        this.rasterCanvas.height = value.height;
    }
}