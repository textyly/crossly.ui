import { RasterDrawingCanvas } from "./base.js";
import { IRasterDrawingCanvas } from "../types.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { StitchThreadArray } from "../../utilities/arrays/thread/stitch.js";

export class StitchRasterDrawingCanvas extends RasterDrawingCanvas implements IRasterDrawingCanvas {
    private minThreadWidth: number;

    constructor(minThreadWidth: number, rasterCanvas: HTMLCanvasElement) {
        super(rasterCanvas);

        this.minThreadWidth = minThreadWidth;
    }

    public drawDots(dots: DotArray): void {
        // stitch canvas does not draw dots because they have a huge perf impact when more than 300x300 stitches in grid are being used
        // better throw an error if someone decides to start drawing dots, hopefully will see this comment
        throw new Error("not implemented because of high performance impact");
    }

    public drawLines(threads: StitchThreadArray): void {
        // CPU, GPU, memory and GC intensive code, do not extract in multiple methods!!!
        const visibilities = threads.visibilities;
        const fromDotsXPositions = threads.fromDotsXPositions;
        const fromDotsYPositions = threads.fromDotsYPositions;
        const toDotsXPositions = threads.toDotsXPositions;
        const toDotsYPositions = threads.toDotsYPositions;
        const widths = threads.zoomedWidths;
        const colors = threads.colors;

        // Path2D is being used for perf optimization otherwise this.context.lineTo has a huge negative perf impact
        let path = this.createPath();
        let previousColor = colors[0];
        const lastIdX = threads.length - 1;

        for (let threadIdx = 0; threadIdx < threads.length; threadIdx++) {
            const currentWidth = widths[threadIdx];
            const currentColor = colors[threadIdx];
            const isVisible = visibilities[threadIdx];

            if (isVisible) {

                if (currentColor !== previousColor) {
                    // closePath and createPath will be executed only on color change (very rare but it depends on the pattern's complexity)
                    this.closePath(path, previousColor);
                    path = this.createPath();
                    previousColor = currentColor;
                }

                const fromX = fromDotsXPositions[threadIdx] - this.bounds.left;
                const fromY = fromDotsYPositions[threadIdx] - this.bounds.top;
                const toX = toDotsXPositions[threadIdx] - this.bounds.left;
                const toY = toDotsYPositions[threadIdx] - this.bounds.top;

                // drawing logic is too big and makes the code too unreadable, 
                // that is why it is extracted in the drawLineInPath/drawPolygonInPath methods (even though additional function invocation will impact the perf since it will be executed for each and every visible stitch)
                if (currentWidth > 4) {
                    // more drawing which means worse performance
                    this.drawPolygonInPath(path, fromX, fromY, toX, toY, currentWidth);
                } else {
                    // less drawing which means better performance
                    if (currentWidth >= 2) {
                        this.drawRectangleInPath(path, fromX, fromY, toX, toY, currentWidth);
                    } else {
                        this.drawLineInPath(path, fromX, fromY, toX, toY, currentWidth);
                    }
                }
            }

            if (threadIdx === lastIdX) {
                // closePath will be executed only once 
                this.closePath(path, currentColor);
            }
        }
    }

    private createPath(): Path2D {
        const path = new Path2D();
        return path;
    }

    private closePath(path: Path2D, color: string): void {
        this.context.strokeStyle = color;
        this.context.stroke(path);

        this.context.fillStyle = color;
        this.context.fill(path);
    }

    private drawLineInPath(path: Path2D, fromX: number, fromY: number, toX: number, toY: number, width: number): void {
        // CPU, GPU, memory and GC intensive code, do not extract in multiple methods!!!

        let w = Math.floor(width / 4);

        // leftTop to rightBottom stitch (diagonal)
        if (fromX < toX && fromY < toY) {
            path.moveTo(fromX + w, fromY + w);
            path.lineTo(toX - w, toY - w);
        }

        // rightBottom to leftTop stitch (diagonal)
        if (fromX > toX && fromY > toY) {
            path.moveTo(fromX - w, fromY - w);
            path.lineTo(toX + w, toY + w);
        }

        // rightTop to leftBottom stitch (diagonal)
        if (fromX > toX && fromY < toY) {
            path.moveTo(fromX - w, fromY + w);
            path.lineTo(toX + w, toY - w);
        }

        // leftBottom to rightTop stitch (diagonal)
        if (fromX < toX && fromY > toY) {
            path.moveTo(fromX + w, fromY - w);
            path.lineTo(toX - w, toY + w);
        }

        // left to right stitch (horizontal)
        if (fromX < toX && fromY == toY) {
            path.moveTo(fromX + w, fromY);
            path.lineTo(toX - w, toY);
        }

        // right to left stitch (horizontal)
        if (fromX > toX && fromY == toY) {
            path.moveTo(fromX - w, fromY);
            path.lineTo(toX + w, toY);
        }

        // top to bottom stitch (vertical)
        if (fromX == toX && fromY < toY) {
            path.moveTo(fromX, fromY + w);
            path.lineTo(toX, toY - w);
        }

        // bottom to top stitch (vertical)
        if (fromX == toX && fromY > toY) {
            path.moveTo(fromX, fromY - w);
            path.lineTo(toX, toY + w);
        }
    }

    private drawRectangleInPath(path: Path2D, fromX: number, fromY: number, toX: number, toY: number, width: number): void {
        // CPU, GPU, memory and GC intensive code, do not extract in multiple methods!!!

        const leg = Math.floor(width / 2);

        // leftTop to rightBottom stitch (diagonal)
        if (fromX < toX && fromY < toY) {
            path.moveTo(fromX, fromY + leg);
            path.lineTo(toX - leg, toY);
            path.lineTo(toX, toY - leg);
            path.lineTo(fromX + leg, fromY);
            path.lineTo(fromX, fromY + leg);
        }

        // rightBottom to leftTop stitch (diagonal)
        if (fromX > toX && fromY > toY) {
            path.moveTo(toX, toY + leg);
            path.lineTo(fromX - leg, fromY);
            path.lineTo(fromX, fromY - leg);
            path.lineTo(toX + leg, toY);
            path.lineTo(toX, toY + leg);
        }

        // rightTop to leftBottom stitch (diagonal)
        if (fromX > toX && fromY < toY) {
            path.moveTo(fromX - leg, fromY);
            path.lineTo(toX, toY - leg);
            path.lineTo(toX + leg, toY);
            path.lineTo(fromX, fromY + leg);
            path.lineTo(fromX - leg, fromY);
        }

        // leftBottom to rightTop stitch (diagonal)
        if (fromX < toX && fromY > toY) {
            path.moveTo(toX - leg, toY);
            path.lineTo(fromX, fromY - leg);
            path.lineTo(fromX + leg, fromY);
            path.lineTo(toX, toY + leg);
            path.lineTo(toX - leg, toY);
        }

        const l = Math.floor(leg / 2);

        // left to right stitch (horizontal)
        if (fromX < toX && fromY == toY) {
            path.moveTo(fromX + l, fromY + l);
            path.lineTo(toX - l, toY + l);
            path.lineTo(toX - l, toY - l);
            path.lineTo(fromX + l, fromY - l);
            path.lineTo(fromX + l, fromY + l);
        }

        // right to left stitch (horizontal)
        if (fromX > toX && fromY == toY) {
            path.moveTo(fromX - l, fromY - l);
            path.lineTo(toX + l, toY - l);
            path.lineTo(toX + l, toY + l);
            path.lineTo(fromX - l, fromY + l);
            path.lineTo(fromX - l, fromY - l);
        }

        // top to bottom stitch (vertical)
        if (fromX == toX && fromY < toY) {
            path.moveTo(fromX - l, fromY + l);
            path.lineTo(toX - l, toY - l);
            path.lineTo(toX + l, toY - l);
            path.lineTo(fromX + l, fromY + l);
            path.lineTo(fromX - l, fromY + l);
        }

        // bottom to top stitch (vertical)
        if (fromX == toX && fromY > toY) {
            path.moveTo(fromX + l, fromY - l);
            path.lineTo(toX + l, toY + l);
            path.lineTo(toX - l, toY + l);
            path.lineTo(fromX - l, fromY - l);
            path.lineTo(fromX + l, fromY - l);
        }
    }

    private drawPolygonInPath(path: Path2D, fromX: number, fromY: number, toX: number, toY: number, width: number): void {
        // CPU, GPU, memory and GC intensive code, do not extract in multiple methods!!!

        // pythagorean equation
        const leg = Math.floor(Math.sqrt((width * width) / 2));

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

        // pythagorean equation
        const l = Math.floor(Math.sqrt((leg * leg) / 2));

        // left to right stitch (horizontal)
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
}