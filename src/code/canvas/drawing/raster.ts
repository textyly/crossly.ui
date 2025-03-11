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
        // TODO: not implemented, throw exception
    }

    public drawLines(threads: ThreadArray): void {
        // CPU, GPU, memory and GC intensive code, do not extract in multiple methods!!!
        if (threads.length <= 0) {
            return;
        }

        //const start = performance.now();

        const visibilities = threads.visibilities;
        const fromDotsXPositions = threads.fromDotsXPositions;
        const fromDotsYPositions = threads.fromDotsYPositions;
        const toDotsXPositions = threads.toDotsXPositions;
        const toDotsYPositions = threads.toDotsYPositions;
        const widths = threads.widths;
        const colors = threads.colors;

        let previousColor = colors[0];
        let previousWidth = widths[0];
        this.context.beginPath();
        for (let threadIdx = 0; threadIdx < threads.length; threadIdx++) {
            const isVisible = visibilities[threadIdx];
            if (!isVisible) {
                if (threadIdx === (threads.length - 1)) {
                    this.context.strokeStyle = previousColor;
                    // this.context.lineWidth = 0.1;

                    //const start1 = performance.now();
                    this.context.stroke();
                    this.context.fillStyle = previousColor;
                    this.context.fill();
                    this.context.closePath();
                    //const end1 = performance.now();
                    //console.log("drawing: ", end1 - start1);
                }
                continue;
            }

            const currentWidth = widths[threadIdx];
            const currentColor = colors[threadIdx];

            const hasDifference = (currentColor !== previousColor) || (currentWidth !== previousWidth);
            if (hasDifference) {
                this.context.strokeStyle = previousColor;
                // this.context.lineWidth = 0.1;
                this.context.stroke();
                this.context.fillStyle = previousColor;
                this.context.fill();
                this.context.closePath();
            }

            if (hasDifference) {
                this.context.beginPath();
                previousColor = currentColor;
                previousWidth = currentWidth;
            }

            const fromX = fromDotsXPositions[threadIdx] - this.bounds.left;
            const fromY = fromDotsYPositions[threadIdx] - this.bounds.top;
            const toX = toDotsXPositions[threadIdx] - this.bounds.left;
            const toY = toDotsYPositions[threadIdx] - this.bounds.top;

            const leg = 1; //Math.sqrt((currentWidth * currentWidth) / 2);
            this.draw(fromX, fromY, toX, toY, leg);

            if (threadIdx === (threads.length - 1)) {
                this.context.strokeStyle = currentColor;
                // this.context.lineWidth = 0.1;
                this.context.stroke();
                this.context.fillStyle = currentColor;
                this.context.fill();
                this.context.closePath();
            }
        }

        //const end = performance.now();
        //console.log("all: ", end - start);
    }

    private draw(fromX: number, fromY: number, toX: number, toY: number, leg: number): void {
        // leftTop to rightBottom stitch (diagonal)
        if (fromX < toX && fromY < toY) {
            this.context.moveTo(fromX, fromY);
            this.context.lineTo(fromX, fromY + leg);
            this.context.lineTo(toX - leg, toY);
            this.context.lineTo(toX, toY);
            this.context.lineTo(toX, toY - leg);
            this.context.lineTo(fromX + leg, fromY);
            this.context.lineTo(fromX, fromY);
        }

        // rightBottom to leftTop stitch (diagonal)
        if (fromX > toX && fromY > toY) {
            this.context.moveTo(toX, toY);
            this.context.lineTo(toX, toY + leg);
            this.context.lineTo(fromX - leg, fromY);
            this.context.lineTo(fromX, fromY);
            this.context.lineTo(fromX, fromY - leg);
            this.context.lineTo(toX + leg, toY);
            this.context.lineTo(toX, toY);
        }

        // rightTop to leftBottom stitch (diagonal)
        if (fromX > toX && fromY < toY) {
            this.context.moveTo(fromX, fromY);
            this.context.lineTo(fromX - leg, fromY);
            this.context.lineTo(toX, toY - leg);
            this.context.lineTo(toX, toY);
            this.context.lineTo(toX + leg, toY);
            this.context.lineTo(fromX, fromY + leg);
            this.context.lineTo(fromX, fromY);
        }

        // leftBottom to rightTop stitch (diagonal)
        if (fromX < toX && fromY > toY) {
            this.context.moveTo(toX, toY);
            this.context.lineTo(toX - leg, toY);
            this.context.lineTo(fromX, fromY - leg);
            this.context.lineTo(fromX, fromY);
            this.context.lineTo(fromX + leg, fromY);
            this.context.lineTo(toX, toY + leg);
            this.context.lineTo(toX, toY);
        }

        // left to right stitch (horizontal)
        if (fromX < toX && fromY == toY) {
            const l = Math.sqrt((leg * leg) / 2);
            this.context.moveTo(fromX, fromY);
            this.context.lineTo(fromX + l, fromY + l);
            this.context.lineTo(toX - l, toY + l);
            this.context.lineTo(toX, toY);
            this.context.lineTo(toX - l, toY - l);
            this.context.lineTo(fromX + l, fromY - l);
            this.context.lineTo(fromX, fromY);
        }

        // right to left stitch (horizontal)
        if (fromX > toX && fromY == toY) {
            const l = Math.sqrt((leg * leg) / 2);
            this.context.moveTo(fromX, fromY);
            this.context.lineTo(fromX - l, fromY - l);
            this.context.lineTo(toX + l, toY - l);
            this.context.lineTo(toX, toY);
            this.context.lineTo(toX + l, toY + l);
            this.context.lineTo(fromX - l, fromY + l);
            this.context.lineTo(fromX, fromY);
        }

        // top to bottom stitch (vertical)
        if (fromX == toX && fromY < toY) {
            const l = Math.sqrt((leg * leg) / 2);
            this.context.moveTo(fromX, fromY);
            this.context.lineTo(fromX - l, fromY + l);
            this.context.lineTo(toX - l, toY - l);
            this.context.lineTo(toX, toY);
            this.context.lineTo(toX + l, toY - l);
            this.context.lineTo(fromX + l, fromY + l);
            this.context.lineTo(fromX, fromY);
        }

        // bottom to top stitch (vertical)
        if (fromX == toX && fromY > toY) {
            const l = Math.sqrt((leg * leg) / 2);
            this.context.moveTo(fromX, fromY);
            this.context.lineTo(fromX + l, fromY - l);
            this.context.lineTo(toX + l, toY + l);
            this.context.lineTo(toX, toY);
            this.context.lineTo(toX - l, toY + l);
            this.context.lineTo(fromX - l, fromY - l);
            this.context.lineTo(fromX, fromY);
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