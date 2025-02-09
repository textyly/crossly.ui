import { CanvasBase } from "../../base.js";
import { IRasterDrawingCanvas } from "../types.js";
import { Dot, Bounds, Thread } from "../../types.js";

export class RasterVirtualDrawingCanvas extends CanvasBase implements IRasterDrawingCanvas {
    private readonly rasterDrawingCanvas: IRasterDrawingCanvas;

    constructor(rasterDrawingCanvas: IRasterDrawingCanvas) {
        super();
        this.rasterDrawingCanvas = rasterDrawingCanvas;
        this.resizeRasterDrawingCanvas();
    }

    public drawDots(dotsX: Array<number>, dotsY: Array<number>, dotRadius: number, dotColor: string): void {
        const visibleDotsX = new Array<number>();
        const visibleDotsY = new Array<number>();

        const canvasX = this.rasterDrawingCanvas.bounds.x;
        const canvasY = this.rasterDrawingCanvas.bounds.y;
        const canvasWidth = this.rasterDrawingCanvas.bounds.width;
        const canvasHeight = this.rasterDrawingCanvas.bounds.height;

        // do not touch `this` or dynamic property in the loop for performance reasons!!!
        for (let index = 0; index < dotsX.length; index++) {
            const x = dotsX[index];
            const y = dotsY[index];

            const isVisibleByX = x >= canvasX && x <= canvasWidth;
            if (isVisibleByX) {
                const isVisibleByY = y >= canvasY && y <= canvasHeight;
                if (isVisibleByY) {
                    visibleDotsX.push(x);
                    visibleDotsY.push(y);
                }
            }
        }

        this.rasterDrawingCanvas.drawDots(visibleDotsX, visibleDotsY, dotRadius, dotColor);
    }

    public drawLines(threads: Array<Thread<Dot>>): void {
        this.rasterDrawingCanvas.drawLines(threads);
    }

    public clear(): void {
        this.rasterDrawingCanvas.clear();
    }

    public override dispose(): void {
        this.rasterDrawingCanvas.dispose();
        super.dispose();
    }

    protected override invokeBoundsChange(bounds: Bounds): void {
        super.invokeBoundsChange(bounds);
    }

    private resizeRasterDrawingCanvas(): void {
        // do not allow raster canvas to resize outside of the client visible area
        const x = 0;
        const y = 0;
        const width = ((window.innerWidth / 10) * 9.8);
        const height = ((window.innerHeight / 10) * 9.3);

        this.rasterDrawingCanvas.bounds = { x, y, width, height };
    }
}