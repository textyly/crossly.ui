import { CanvasBase } from "../base.js";
import { Dot, Bounds, Thread } from "../types.js";
import { IRasterDrawingCanvas } from "./types.js";

export class RasterDrawingCanvas extends CanvasBase implements IRasterDrawingCanvas {
    private readonly endAngle: number;
    private readonly context: CanvasRenderingContext2D;

    constructor(private rasterCanvas: HTMLCanvasElement) {
        super();
        this.endAngle = Math.PI * 2;
        this.context = rasterCanvas.getContext("2d", { willReadFrequently: true })!;
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

    public drawLines(visible: Array<boolean>, fromDotsX: Array<number>, fromDotsY: Array<number>, toDotsX: Array<number>, toDotsY: Array<number>, widths: Array<number>, colors: Array<string>): void {
        this.context.beginPath();

        for (let index = 0; index < fromDotsX.length; index++) {
            const isVisible = visible[index];
            if (!isVisible) {
                continue;
            }

            // do not move extract a drawLine method for perf reasons
            this.context.lineWidth = widths[index];
            this.context.strokeStyle = colors[index];

            this.context.moveTo(fromDotsX[index], fromDotsY[index]);
            this.context.lineTo(toDotsX[index], toDotsY[index]);
        }

        this.context.stroke();
        this.context.closePath();
    }

    public clear(): void {
        this.context.clearRect(this.bounds.left, this.bounds.top, this.bounds.width, this.bounds.height);
    }

    protected override invokeBoundsChange(bounds: Bounds): void {
        super.invokeBoundsChange(bounds);

        const x = bounds.left;
        const y = bounds.top;
        const width = bounds.width;
        const height = bounds.height;

        this.rasterCanvas.style.transform = `translate(${x}px, ${y}px, ${width}px, ${height}px)`;
        this.rasterCanvas.width = width;
        this.rasterCanvas.height = height;
    }
}