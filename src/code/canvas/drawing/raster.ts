import { Bounds } from "../types.js";
import { CanvasBase } from "../base.js";
import { DotArray } from "../utilities/arrays/dot/dot.js";
import { FabricThreadArray } from "../utilities/arrays/thread/fabric.js";
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

    public drawDots(dots: DotArray): void {
        // CPU, GPU, memory and GC intensive code
        this.context.beginPath();

        const dotsX = dots.dotsX;
        const dotsY = dots.dotsY;
        const radiuses = dots.radiuses;
        const colors = dots.colors;

        for (let index = 0; index < dots.length; index++) {
            const x = dotsX[index] - this.bounds.left;
            const y = dotsY[index] - this.bounds.top;

            this.context.fillStyle = colors[index];
            this.context.moveTo(x, y);

            this.context.arc(x, y, radiuses[index], 0, this.endAngle);
        }

        this.context.fill();
    }

    public drawLines(threads: FabricThreadArray): void {
        // CPU, GPU, memory and GC intensive code
        this.context.beginPath();

        const visibility = threads.visibility;
        const fromDotsXPos = threads.fromDotsXPos;
        const fromDotsYPos = threads.fromDotsYPos;
        const toDotsXPos = threads.toDotsXPos;
        const toDotsYPos = threads.toDotsYPos;
        const widths = threads.widths;
        const colors = threads.colors;

        for (let index = 0; index < threads.length; index++) {
            const isVisible = visibility[index];
            if (!isVisible) {
                continue;
            }

            this.context.lineWidth = widths[index];
            this.context.strokeStyle = colors[index];

            this.context.moveTo(fromDotsXPos[index] - this.bounds.left, fromDotsYPos[index] - this.bounds.top);
            this.context.lineTo(toDotsXPos[index] - this.bounds.left, toDotsYPos[index] - this.bounds.top);
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