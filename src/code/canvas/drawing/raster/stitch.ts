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
        // stitch canvas does not draw dots because they have a huge performance impact when more than 300x300 stitch grid is being used
        // better throw an error if someone decides to start drawing dots, hopefully will see this comment
        throw new Error("not implemented because of high performance impact");
    }

    public drawLines(threads: ThreadArray): void {
        // CPU, GPU, memory and GC intensive code, do not extract in multiple methods!!!
        const visibilities = threads.visibilities;
        const fromDotsXPositions = threads.fromDotsXPositions;
        const fromDotsYPositions = threads.fromDotsYPositions;
        const toDotsXPositions = threads.toDotsXPositions;
        const toDotsYPositions = threads.toDotsYPositions;
        const widths = threads.widths;
        const colors = threads.colors;

        let path = this.createPath();
        let previousColor = colors[0];
        const lastIdX = threads.length - 1;

        for (let threadIdx = 0; threadIdx < threads.length; threadIdx++) {
            const currentWidth = widths[threadIdx];
            const currentColor = colors[threadIdx];
            const isVisible = visibilities[threadIdx];

            if (isVisible) {

                if (currentColor !== previousColor) {
                    // fillPath and createPath will be executed only on color change (very rare but depending on the pattern's complexity)
                    this.fillPath(path, previousColor);
                    path = this.createPath();
                    previousColor = currentColor;
                }

                const fromX = fromDotsXPositions[threadIdx] - this.bounds.left;
                const fromY = fromDotsYPositions[threadIdx] - this.bounds.top;
                const toX = toDotsXPositions[threadIdx] - this.bounds.left;
                const toY = toDotsYPositions[threadIdx] - this.bounds.top;

                // pythagorean equation
                const leg = Math.floor(Math.sqrt((currentWidth * currentWidth) / 2));

                // drawing logic is too big and make the code too unreadable, 
                // that is why it is extracted in the drawInPath method (even though additional function invocation will impact the performance since it will be executed for each and every visible stitch)
                this.drawInPath(path, fromX, fromY, toX, toY, leg);
            }

            if (threadIdx === lastIdX) {
                // fillPath will be executed only once 
                this.fillPath(path, currentColor);
            }
        }
    }

    private createPath(): Path2D {
        const path = new Path2D();
        return path;
    }

    private drawInPath(path: Path2D, fromX: number, fromY: number, toX: number, toY: number, leg: number): void {
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

    private fillPath(path: Path2D, color: string): void {
        this.context.strokeStyle = color;
        this.context.stroke(path);
        this.context.fillStyle = color;
        this.context.fill(path);
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