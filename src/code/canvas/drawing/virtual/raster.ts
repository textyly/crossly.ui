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

    public drawDots(dots: Array<Dot>, dotRadius: number, dotColor: string): void {
        const visibleDots = dots.filter((dot) => this.isVisibleDot(dot));
        this.rasterDrawingCanvas.drawDots(visibleDots, dotRadius, dotColor);
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

    // TODO: extract in a different class
    private isVisibleDot(dot: Dot): boolean {
        const canvasX = this.rasterDrawingCanvas.bounds.x;
        const canvasY = this.rasterDrawingCanvas.bounds.y;
        const canvasWidth = this.rasterDrawingCanvas.bounds.width;
        const canvasHeight = this.rasterDrawingCanvas.bounds.height;

        const isVisibleByX = dot.x >= canvasX && dot.x <= canvasWidth;
        const isVisibleByY = dot.y >= canvasY && dot.y <= canvasHeight;

        return isVisibleByX && isVisibleByY;
    }
}