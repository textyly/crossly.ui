import { Bounds } from "../../types.js";
import { CanvasBase } from "../../base.js";
import { IRasterDrawingCanvas } from "../types.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { ThreadArray } from "../../utilities/arrays/thread/array.js";

export class RasterDrawingStitchCanvas extends CanvasBase implements IRasterDrawingCanvas {
    private readonly context: CanvasRenderingContext2D;

    constructor(private rasterCanvas: HTMLCanvasElement) {
        super();
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
        throw new Error("not implemented");
    }

    public drawLines(threads: ThreadArray): void {
        // CPU, GPU, memory and GC intensive code, do not extract in multiple methods!!!
        if (threads.length <= 0) {
            return;
        }

        const visibilities = threads.visibilities;
        const fromDotsXPositions = threads.fromDotsXPositions;
        const fromDotsYPositions = threads.fromDotsYPositions;
        const toDotsXPositions = threads.toDotsXPositions;
        const toDotsYPositions = threads.toDotsYPositions;
        const widths = threads.widths;
        const colors = threads.colors;

        let previousColor = colors[0];
        let previousWidth = widths[0];
        let path = new Path2D();
        for (let threadIdx = 0; threadIdx < threads.length; threadIdx++) {
            const isVisible = visibilities[threadIdx];
            if (!isVisible) {
                if (threadIdx === (threads.length - 1)) {
                    this.context.strokeStyle = previousColor;
                    // this.context.lineWidth = 0.1;

                    this.context.stroke(path);
                    this.context.fillStyle = previousColor;
                    this.context.fill(path);
                }
                continue;
            }

            const currentWidth = widths[threadIdx];
            const currentColor = colors[threadIdx];

            const hasDifference = (currentColor !== previousColor) || (currentWidth !== previousWidth);
            if (hasDifference) {
                this.context.strokeStyle = previousColor;
                // this.context.lineWidth = 0.1;
                this.context.stroke(path);
                this.context.fillStyle = previousColor;
                this.context.fill(path);
            }

            if (hasDifference) {
                path = new Path2D();
                previousColor = currentColor;
                previousWidth = currentWidth;
            }

            const fromX = fromDotsXPositions[threadIdx] - this.bounds.left;
            const fromY = fromDotsYPositions[threadIdx] - this.bounds.top;
            const toX = toDotsXPositions[threadIdx] - this.bounds.left;
            const toY = toDotsYPositions[threadIdx] - this.bounds.top;

            const leg = Math.floor(Math.sqrt((currentWidth * currentWidth) / 2));
            this.draw(fromX, fromY, toX, toY, leg, path);

            if (threadIdx === (threads.length - 1)) {
                this.context.strokeStyle = currentColor;
                // this.context.lineWidth = 0.1;
                this.context.stroke(path);
                this.context.fillStyle = currentColor;
                this.context.fill(path);
            }
        }
    }

    private draw(fromX: number, fromY: number, toX: number, toY: number, leg: number, path: Path2D): void {
        // leftTop to rightBottom stitch (diagonal)
        if (fromX < toX && fromY < toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX, fromY + leg);
            path.lineTo(toX - leg, toY);
            path.lineTo(toX, toY);
            path.lineTo(toX, toY - leg);
            path.lineTo(fromX + leg, fromY);
            path.lineTo(fromX, fromY);
        }

        // rightBottom to leftTop stitch (diagonal)
        if (fromX > toX && fromY > toY) {
            path.moveTo(toX, toY);
            path.lineTo(toX, toY + leg);
            path.lineTo(fromX - leg, fromY);
            path.lineTo(fromX, fromY);
            path.lineTo(fromX, fromY - leg);
            path.lineTo(toX + leg, toY);
            path.lineTo(toX, toY);
        }

        // rightTop to leftBottom stitch (diagonal)
        if (fromX > toX && fromY < toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX - leg, fromY);
            path.lineTo(toX, toY - leg);
            path.lineTo(toX, toY);
            path.lineTo(toX + leg, toY);
            path.lineTo(fromX, fromY + leg);
            path.lineTo(fromX, fromY);
        }

        // leftBottom to rightTop stitch (diagonal)
        if (fromX < toX && fromY > toY) {
            path.moveTo(toX, toY);
            path.lineTo(toX - leg, toY);
            path.lineTo(fromX, fromY - leg);
            path.lineTo(fromX, fromY);
            path.lineTo(fromX + leg, fromY);
            path.lineTo(toX, toY + leg);
            path.lineTo(toX, toY);
        }

        // left to right stitch (horizontal)
        const l = Math.floor(Math.sqrt((leg * leg) / 2));
        if (fromX < toX && fromY == toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX + l, fromY + l);
            path.lineTo(toX - l, toY + l);
            path.lineTo(toX, toY);
            path.lineTo(toX - l, toY - l);
            path.lineTo(fromX + l, fromY - l);
            path.lineTo(fromX, fromY);
        }

        // right to left stitch (horizontal)
        if (fromX > toX && fromY == toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX - l, fromY - l);
            path.lineTo(toX + l, toY - l);
            path.lineTo(toX, toY);
            path.lineTo(toX + l, toY + l);
            path.lineTo(fromX - l, fromY + l);
            path.lineTo(fromX, fromY);
        }

        // top to bottom stitch (vertical)
        if (fromX == toX && fromY < toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX - l, fromY + l);
            path.lineTo(toX - l, toY - l);
            path.lineTo(toX, toY);
            path.lineTo(toX + l, toY - l);
            path.lineTo(fromX + l, fromY + l);
            path.lineTo(fromX, fromY);
        }

        // bottom to top stitch (vertical)
        if (fromX == toX && fromY > toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX + l, fromY - l);
            path.lineTo(toX + l, toY + l);
            path.lineTo(toX, toY);
            path.lineTo(toX - l, toY + l);
            path.lineTo(fromX - l, fromY - l);
            path.lineTo(fromX, fromY);
        }
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