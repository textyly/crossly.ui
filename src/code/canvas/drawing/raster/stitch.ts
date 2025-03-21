import { RasterDrawingCanvas } from "./base.js";
import { Density } from "../../virtual/types.js";
import { IRasterDrawingCanvas } from "../types.js";
import { ShapeDrawing } from "./primitives/shape.js";
import { RasterLineDrawing } from "./primitives/line.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { RasterPolygonDrawing } from "./primitives/polygon.js";
import { RasterRectangleDrawing } from "./primitives/rectangle.js";
import { StitchThreadArray } from "../../utilities/arrays/thread/stitch.js";

export class StitchRasterDrawingCanvas extends RasterDrawingCanvas implements IRasterDrawingCanvas {
    private shape: ShapeDrawing;

    constructor(rasterCanvas: HTMLCanvasElement) {
        super(rasterCanvas);

        const line = new RasterLineDrawing();
        const polygon = new RasterPolygonDrawing();
        const rectangle = new RasterRectangleDrawing();
        this.shape = new ShapeDrawing(line, rectangle, polygon);
    }

    public drawDots(dots: DotArray): void {
        // stitch canvas does not draw dots because they have a huge perf impact when more than 300x300 stitches in grid are being used
        // better throw an error if someone decides to start drawing dots, hopefully will see this comment
        throw new Error("not implemented because of high performance impact");
    }

    public drawLines(threads: StitchThreadArray, density: Density): void {
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
                this.shape.draw(density, path, fromX, fromY, toX, toY, currentWidth);
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
}