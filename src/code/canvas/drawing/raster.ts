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

    public async createBitMap(): Promise<ImageBitmap> {
        const bitmap = await createImageBitmap(this.rasterCanvas);
        return bitmap;
    }

    public drawBitMap(bitmap: ImageBitmap): void {
        const bounds = this.bounds;
        this.context.drawImage(bitmap, 0, 0, bounds.width, bounds.height);
    }

    public drawDots(dotsX: Array<number>, dotsY: Array<number>, radius: number, color: string): void {
        this.context.beginPath();

        for (let index = 0; index < dotsX.length; index++) {
            const x = dotsX[index] - this.bounds.left;
            const y = dotsY[index] - this.bounds.top;

            this.context.fillStyle = color;
            this.context.moveTo(x, y);

            this.context.arc(x, y, radius, 0, this.endAngle);
        }

        this.context.fill();
    }

    public drawLines(visible: Array<boolean>, fromDotsX: Array<number>, fromDotsY: Array<number>, toDotsX: Array<number>, toDotsY: Array<number>, widths: Array<number>, colors: Array<string>): void {
        this.context.beginPath();

        for (let index = 0; index < fromDotsX.length; index++) {
            // TODO: do not supply visible!!! Remove this if
            const isVisible = visible[index];
            if (!isVisible) {
                continue;
            }

            this.context.lineWidth = widths[index];
            this.context.strokeStyle = colors[index];

            this.context.moveTo(fromDotsX[index] - this.bounds.left, fromDotsY[index] - this.bounds.top);
            this.context.lineTo(toDotsX[index] - this.bounds.left, toDotsY[index] - this.bounds.top);
        }

        this.context.stroke();
        this.context.closePath();
    }

    public clear(): void {
        this.context.clearRect(0, 0, this.bounds.width, this.bounds.height);
    }

    protected override invokeBoundsChange(bounds: Bounds): void {
        super.invokeBoundsChange(bounds);

        const x = bounds.left;
        const y = bounds.top;
        const width = bounds.width;
        const height = bounds.height;

        this.rasterCanvas.style.transform = `translate(${x}px, ${y}px)`;

        if (width !== this.rasterCanvas.width || height !== this.rasterCanvas.height) {
            this.rasterCanvas.height = height;
            this.rasterCanvas.width = width;
        }
    }
}