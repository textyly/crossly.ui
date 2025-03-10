import { Bounds } from "../types.js";
import { CanvasBase } from "../base.js";
import { IRasterDrawingCanvas } from "./types.js";
import { DotArray } from "../utilities/arrays/dot/dot.js";
import { ThreadArray } from "../utilities/arrays/thread/array.js";

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
        // color -> (radius -> indexes)
        const radiuses = dots.radiuses;
        const colors = dots.colors;

        const groups = new Map<string, Map<number, Array<number>>>();

        for (let index = 0; index < dots.length; index++) {
            const radius = radiuses[index];
            const color = colors[index];

            if (!groups.has(color)) {
                const rs = new Map<number, Array<number>>();
                groups.set(color, rs);
            }

            const rs = groups.get(color)!;
            if (!rs.has(radius)) {
                rs.set(radius, []);
            }

            const indexes = rs.get(radius)!;
            indexes.push(index);
        }

        this.drawDotsCore(dots, groups);
    }

    public drawLines(threads: ThreadArray): void {
        const widths = threads.widths;
        const colors = threads.colors;

        const groups = new Map<string, Map<number, Array<number>>>();

        for (let index = 0; index < threads.length; index++) {
            const width = widths[index];
            const color = colors[index];

            if (!groups.has(color)) {
                const ws = new Map<number, Array<number>>();
                groups.set(color, ws);
            }

            const ws = groups.get(color)!;
            if (!ws.has(width)) {
                ws.set(width, []);
            }

            const indexes = ws.get(width)!;
            indexes.push(index);
        }

        this.drawLinesCore(threads, groups);
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

    private drawDotsCore(dots: DotArray, groups: Map<string, Map<number, Array<number>>>): void {
        // CPU, GPU, memory and GC intensive code

        groups.forEach((radiuses, color) => {
            radiuses.forEach((indexes, radius) => {
                this.context.beginPath();

                const dotsX = dots.dotsX;
                const dotsY = dots.dotsY;

                for (let index = 0; index < indexes.length; index++) {
                    const idx = indexes[index];
                    const x = dotsX[idx] - this.bounds.left;
                    const y = dotsY[idx] - this.bounds.top;

                    this.context.fillStyle = color;
                    this.context.moveTo(x, y);
                    this.context.arc(x, y, radius, 0, this.endAngle);
                }

                this.context.fill();

            });
        });
    }

    private drawLinesCore(threads: ThreadArray, groups: Map<string, Map<number, Array<number>>>): void {
        // CPU, GPU, memory and GC intensive code
        groups.forEach((widths, color) => {
            widths.forEach((indexes, width) => {
                this.context.beginPath();

                const visibility = threads.visibilities;
                const fromDotsXPositions = threads.fromDotsXPositions;
                const fromDotsYPositions = threads.fromDotsYPositions;
                const toDotsXPositions = threads.toDotsXPositions;
                const toDotsYPositions = threads.toDotsYPositions;

                for (let index = 0; index < threads.length; index++) {
                    const idx = indexes[index];
                    const isVisible = visibility[idx];
                    if (!isVisible) {
                        continue;
                    }ф

                    this.context.lineWidth = width;
                    this.context.strokeStyle = color;

                    this.context.moveTo(fromDotsXPositions[idx] - this.bounds.left, fromDotsYPositions[idx] - this.bounds.top);
                    this.context.lineTo(toDotsXPositions[idx] - this.bounds.left, toDotsYPositions[idx] - this.bounds.top);
                }

                this.context.stroke();
                this.context.closePath();
            });
        });
    }
}