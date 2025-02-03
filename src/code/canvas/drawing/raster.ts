import { CanvasBase } from "../base.js";
import { IRasterDrawingCanvas } from "./types.js";
import { Dot, Bounds, Thread } from "../types.js";

export class RasterDrawingCanvas extends CanvasBase implements IRasterDrawingCanvas {
    private readonly context: CanvasRenderingContext2D;

    constructor(private rasterCanvas: HTMLCanvasElement) {
        super();
        this.context = rasterCanvas.getContext("2d")!;
    }

    public override get bounds(): Bounds {
        return super.bounds;
    }

    public override set bounds(value: Bounds) {
        super.bounds = value;

        const x = value.x;
        const y = value.y;
        const width = value.width;
        const height = value.height;

        this.rasterCanvas.style.transform = `translate(${x}px, ${y}px, ${width}px, ${height}px)`;
        this.rasterCanvas.width = width;
        this.rasterCanvas.height = height;
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
}