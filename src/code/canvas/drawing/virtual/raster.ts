import { CanvasBase } from "../../base.js";
import { IRasterDrawingCanvas } from "../types.js";
import { Dot, Bounds, Thread } from "../../types.js";

export class RasterVirtualDrawingCanvas extends CanvasBase implements IRasterDrawingCanvas {
    private readonly rasterDrawingCanvas: IRasterDrawingCanvas;

    constructor(rasterDrawingCanvas: IRasterDrawingCanvas) {
        super();
        this.rasterDrawingCanvas = rasterDrawingCanvas;
    }

    public drawDots(dots: Array<Dot>): void {
        const visibleDots = dots.filter((dot) => this.isVisibleDot(dot));
        this.rasterDrawingCanvas.drawDots(visibleDots);
    }

    public drawLines(threads: Array<Thread<Dot>>): void {
        const visibleLines = threads.filter((thread) => this.isVisibleLine(thread));
        this.rasterDrawingCanvas.drawLines(visibleLines);
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
        this.resizeRasterDrawingCanvas(bounds);
    }

    private resizeRasterDrawingCanvas(bounds: Bounds): void {
        // do not allow raster canvas to resize outside of the client visible area
        const x = 0;
        const y = 0;
        const width = ((window.innerWidth / 10) * 9.8);
        const height = ((window.innerHeight / 10) * 9.3);

        this.rasterDrawingCanvas.bounds = { x, y, width, height };
    }

    private isVisibleDot(dot: Dot): boolean {
        return true;
    }

    private isVisibleLine(thread: Thread<Dot>): boolean {
        return true;
    }
}