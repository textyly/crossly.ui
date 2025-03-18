import { RasterLineDrawing } from "./line.js";
import { RasterDrawingCanvas } from "./base.js";
import { RasterPolygonDrawing } from "./polygon.js";
import { RasterRectangleDrawing } from "./rectangle.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { IRasterDrawingCanvas, IShapeDrawing } from "../types.js";
import { StitchThreadArray } from "../../utilities/arrays/thread/stitch.js";

export class StitchRasterDrawingCanvas extends RasterDrawingCanvas implements IRasterDrawingCanvas {
    private line: IShapeDrawing;
    private polygon: IShapeDrawing;
    private rectangle: IShapeDrawing;

    constructor(rasterCanvas: HTMLCanvasElement) {
        super(rasterCanvas);

        this.line = new RasterLineDrawing();
        this.polygon = new RasterPolygonDrawing();
        this.rectangle = new RasterRectangleDrawing();
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
                if (currentWidth > 6) {
                    // more drawing which means worse performance
                    this.polygon.draw(path, fromX, fromY, toX, toY, currentWidth);
                } else {
                    // less drawing which means better performance
                    if (currentWidth >= 2) {
                        this.rectangle.draw(path, fromX, fromY, toX, toY, currentWidth);
                    } else {
                        this.line.draw(path, fromX, fromY, toX, toY, currentWidth);
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
}