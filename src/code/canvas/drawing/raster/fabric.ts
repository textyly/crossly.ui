import assert from "../../../asserts/assert.js";
import { RasterDrawingCanvas } from "./raster.js";
import { IFabricRasterDrawingCanvas } from "../types.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { FabricThread } from "../../utilities/arrays/thread/fabric.js";

export class FabricRasterDrawingCanvas extends RasterDrawingCanvas implements IFabricRasterDrawingCanvas {
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

    public drawLines(threads: FabricThread): void {
        super.ensureAlive();
        assert.defined(threads, "ThreadArray");

        this.drawLinesCore(threads);
    }

    private drawDotsCore(dots: DotArray): void {
        // CPU, GPU, memory and GC intensive code, do not extract logic in multiple methods!!!
        const dotsX = dots.dotsX;
        const dotsY = dots.dotsY;
        const color = dots.color;
        const radius = dots.radius;

        this.context.beginPath();

        for (let index = 0; index < dots.length; index++) {
            const x = dotsX[index] - this.bounds.left;
            const y = dotsY[index] - this.bounds.top;

            this.context.moveTo(x, y);
            this.context.arc(x, y, radius, 0, this.endAngle);
        }

        this.context.fillStyle = color;
        this.context.fill();

        this.context.closePath();
    }

    private drawLinesCore(threads: FabricThread): void {
        // CPU, GPU, memory and GC intensive code, do not extract logic in multiple methods!!!
        const positionsX1 = threads.positionsX1;
        const positionsY1 = threads.positionsY1;
        const positionsX2 = threads.positionsX2;
        const positionsY2 = threads.positionsY2;

        this.context.beginPath();

        for (let index = 0; index < threads.length; index++) {
            this.context.moveTo(positionsX1[index] - this.bounds.left, positionsY1[index] - this.bounds.top);
            this.context.lineTo(positionsX2[index] - this.bounds.left, positionsY2[index] - this.bounds.top);
        }

        this.context.lineWidth = threads.width;
        this.context.strokeStyle = threads.color;

        this.context.stroke();
        this.context.closePath();
    }
}