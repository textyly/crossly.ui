import assert from "../../../asserts/assert.js";
import { RasterDrawingCanvas } from "./raster.js";
import { IRasterDrawingCanvas } from "../types.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { ThreadArray } from "../../utilities/arrays/thread/array.js";

export class FabricRasterDrawingCanvas extends RasterDrawingCanvas implements IRasterDrawingCanvas {
    private readonly endAngle: number;

    constructor(rasterCanvas: HTMLCanvasElement) {
        super(rasterCanvas);

        this.endAngle = Math.PI * 2;
    }

    public drawDots(dots: DotArray): void {
        super.ensureAlive();
        assert.defined(dots, "DotArray");

        this.drawDotsCore(dots);
    }

    public drawLines(threads: ThreadArray): void {
        super.ensureAlive();
        assert.defined(threads, "ThreadArray");

        this.drawLinesCore(threads);
    }

    private drawDotsCore(dots: DotArray): void {
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
        this.context.closePath();
    }

    private drawLinesCore(threads: ThreadArray): void {
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
}