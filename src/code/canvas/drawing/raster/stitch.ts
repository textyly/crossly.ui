import assert from "../../../asserts/assert.js";
import { Density } from "../../virtual/types.js";
import { RasterDrawingCanvas } from "./raster.js";
import { ShapeDrawing } from "./primitives/shape.js";
import { IStitchRasterDrawingCanvas } from "../types.js";
import { RasterLineDrawing } from "./primitives/line.js";
import { RasterPolygonDrawing } from "./primitives/polygon.js";
import { RasterRectangleDrawing } from "./primitives/rectangle.js";
import { CanvasSide, StitchPattern, StitchSegment } from "../../types.js";

export class StitchRasterDrawingCanvas extends RasterDrawingCanvas implements IStitchRasterDrawingCanvas {
    private shape: ShapeDrawing;

    constructor(rasterCanvas: HTMLCanvasElement, backRasterCanvas: HTMLCanvasElement) {
        super(StitchRasterDrawingCanvas.name, rasterCanvas, backRasterCanvas);

        const line = new RasterLineDrawing();
        const polygon = new RasterPolygonDrawing();
        const rectangle = new RasterRectangleDrawing();

        this.shape = new ShapeDrawing(line, rectangle, polygon);
    }

    public drawLine(segment: StitchSegment, density: Density): void {
        const path = this.createPath();

        const width = segment.width;
        const color = segment.color;
        const side = segment.side;
        const fromX = segment.from.x - this.bounds.left;
        const fromY = segment.from.y - this.bounds.top;
        const toX = segment.to.x - this.bounds.left;
        const toY = segment.to.y - this.bounds.top;

        this.shape.draw(density, path, fromX, fromY, toX, toY, width);

        if (side === CanvasSide.Front) {
            this.drawPath(path, color);
        } else {
            this.drawBackPath(path, color);
        }
    }

    public drawLines(pattern: StitchPattern, density: Density): void {
        super.ensureAlive();

        assert.greaterThanZero(pattern.length, "pattern.length");

        this.drawLinesCore(pattern, density);
    }

    private drawLinesCore(pattern: StitchPattern, density: Density): void {
        // CPU, GPU, memory and GC intensive code, do not extract in multiple methods!!!
        let previousThreadColor = pattern[0].color;

        let frontPath = this.createPath();
        let backPath = this.createPath();

        const left = this.bounds.left;
        const top = this.bounds.top;

        for (let threadIdx = 0; threadIdx < pattern.length; threadIdx++) {

            const currentThread = pattern[threadIdx];
            const visibilities = currentThread.visibilities;
            const positionsX = currentThread.positionsX;
            const positionsY = currentThread.positionsY;

            if (currentThread.color !== previousThreadColor) {
                this.drawPath(frontPath, previousThreadColor);
                this.drawBackPath(backPath, previousThreadColor);

                frontPath = this.createPath();
                backPath = this.createPath();
            }

            for (let dotIdx = 1; dotIdx < currentThread.length; dotIdx++) {

                // if `from` or `to` visible then draw the line (segment)
                const isSegmentVisible = visibilities[dotIdx - 1] || visibilities[dotIdx];

                if (isSegmentVisible) {
                    // filter out back stitches as well as stitches positioned out of the visible area
                    const path = (dotIdx % 2 !== 0) ? frontPath : backPath;

                    this.shape.draw(
                        density,
                        path,
                        positionsX[dotIdx - 1] - left,
                        positionsY[dotIdx - 1] - top,
                        positionsX[dotIdx] - left,
                        positionsY[dotIdx] - top,
                        currentThread.zoomedWidth);
                }
            }

            previousThreadColor = currentThread.color;
        }

        this.drawPath(frontPath, previousThreadColor);
        this.drawBackPath(backPath, previousThreadColor);

    }

    private createPath(): Path2D {
        const path = new Path2D();
        return path;
    }

    private drawPath(path: Path2D, color: string): void {
        this.drawPathCore(path, color, this.rasterCanvasContext);
    }

    private drawBackPath(path: Path2D, color: string): void {
        this.drawPathCore(path, color, this.backRasterCanvasContext);
    }

    private drawPathCore(path: Path2D, color: string, canvasContext: CanvasRenderingContext2D): void {
        canvasContext.strokeStyle = color;
        canvasContext.stroke(path);

        canvasContext.fillStyle = color;
        canvasContext.fill(path);
    }
}