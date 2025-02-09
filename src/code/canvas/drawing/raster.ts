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

    public drawDots(dotsX: Array<number>, dotsY: Array<number>, radius: number, color: string): void {
        this.context.beginPath();
        const endAngle = Math.PI * 2;
        for (let index = 0; index < dotsX.length; index++) {
            const x = dotsX[index];
            const y = dotsY[index];
         
            this.context.fillStyle = color;
            this.context.moveTo(x, y);
            this.context.arc(x, y, radius, 0, endAngle);
        }

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
        this.context.clearRect(0, 0, this.rasterCanvas.clientWidth, this.rasterCanvas.clientHeight);
    }
}