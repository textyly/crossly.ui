import { CanvasBase } from "../base.js";
import { Dot, Bounds, Thread } from "../types.js";
import { IRasterDrawingCanvas } from "./types.js";

export class RasterDrawingCanvas extends CanvasBase implements IRasterDrawingCanvas {
    private readonly endAngle: number;
    private readonly context: CanvasRenderingContext2D;

    constructor(private rasterCanvas: HTMLCanvasElement) {
        super();
        this.endAngle = Math.PI * 2;
        this.context = rasterCanvas.getContext("2d")!;
    }

    public drawDots(dotsX: Array<number>, dotsY: Array<number>, radius: number, color: string): void {
        this.context.beginPath();

        for (let index = 0; index < dotsX.length; index++) {
            const x = dotsX[index];
            const y = dotsY[index];

            // do not extract a drawDot method for perf reasons
            this.context.fillStyle = color;
            this.context.moveTo(x, y);
            this.context.arc(x, y, radius, 0, this.endAngle);
        }

        this.context.fill();
    }

    public drawLines(threads: Array<Thread<Dot>>): void {
        this.context.beginPath();

        threads.forEach((thread) => {
            // do not move extract a drawLine method for perf reasons
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
        this.context.clearRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    }

    protected override invokeBoundsChange(bounds: Bounds): void {
        super.invokeBoundsChange(bounds);

        const x = bounds.x;
        const y = bounds.y;
        const width = bounds.width;
        const height = bounds.height;

        this.rasterCanvas.style.transform = `translate(${x}px, ${y}px, ${width}px, ${height}px)`;
        this.rasterCanvas.width = width;
        this.rasterCanvas.height = height;
    }
}