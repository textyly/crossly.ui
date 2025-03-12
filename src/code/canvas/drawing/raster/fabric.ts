import { Bounds } from "../../types.js";
import { CanvasBase } from "../../base.js";
import { IRasterDrawingCanvas } from "../types.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { ThreadArray } from "../../utilities/arrays/thread/array.js";

export class RasterDrawingFabricCanvas extends CanvasBase implements IRasterDrawingCanvas {
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
        // CPU, GPU, memory and GC intensive code, do not extract logic in multiple methods!!!
        const dotsX = dots.dotsX;
        const dotsY = dots.dotsY;
        const radiuses = dots.radiuses;
        const colors = dots.colors;

        this.context.beginPath();

        for (let index = 0; index < dots.length; index++) {
            const x = dotsX[index] - this.bounds.left;
            const y = dotsY[index] - this.bounds.top;

            this.context.fillStyle = colors[index];
            this.context.moveTo(x, y);

            this.context.arc(x, y, radiuses[index], 0, this.endAngle);
        }

        this.context.fill();
    }

    public drawLines(threads: ThreadArray): void {
        // CPU, GPU, memory and GC intensive code, do not extract logic in multiple methods!!!
        const visibility = threads.visibilities;
        const fromDotsXPositions = threads.fromDotsXPositions;
        const fromDotsYPositions = threads.fromDotsYPositions;
        const toDotsXPositions = threads.toDotsXPositions;
        const toDotsYPositions = threads.toDotsYPositions;
        const widths = threads.widths;
        const colors = threads.colors;

        this.context.beginPath();

        for (let index = 0; index < threads.length; index++) {
            const isVisible = visibility[index];
            if (!isVisible) {
                continue;
            }

            this.context.lineWidth = widths[index];
            this.context.strokeStyle = colors[index];

            this.context.moveTo(fromDotsXPositions[index] - this.bounds.left, fromDotsYPositions[index] - this.bounds.top);
            this.context.lineTo(toDotsXPositions[index] - this.bounds.left, toDotsYPositions[index] - this.bounds.top);
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