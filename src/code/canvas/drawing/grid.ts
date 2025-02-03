import { CanvasBase } from "../base.js";
import { Id, BoundsChangeEvent, GridThread } from "../types.js";
import { DrawGridDotsEvent, DrawGridThreadsEvent, IGridCanvas } from "../virtual/types.js";
import { IGridDrawingCanvas, IRasterVirtualDrawingCanvas, IVectorVirtualDrawingCanvas } from "./types.js";

export class GridDrawingCanvas extends CanvasBase implements IGridDrawingCanvas {
    private readonly rasterVirtualDrawing: IRasterVirtualDrawingCanvas;
    private readonly vectorVirtualDrawing: IVectorVirtualDrawingCanvas;
    
    private readonly threads: Map<Id, GridThread>;

    constructor(rasterVirtualDrawing: IRasterVirtualDrawingCanvas, vectorVirtualDrawing: IVectorVirtualDrawingCanvas) {
        super();
        this.rasterVirtualDrawing = rasterVirtualDrawing;
        this.vectorVirtualDrawing = vectorVirtualDrawing;
        
        this.threads = new Map<Id, GridThread>();
    }

    public subscribe(gridCanvas: IGridCanvas): void {
        const drawVisibleDotsUn = gridCanvas.onDrawVisibleDots(this.handleDrawVisibleDots.bind(this));
        super.registerUn(drawVisibleDotsUn);

        const drawVisibleThreadsUn = gridCanvas.onDrawVisibleThreads(this.handleDrawVisibleThreads.bind(this));
        super.registerUn(drawVisibleThreadsUn);

        const redrawUn = gridCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const boundsChangeUn = gridCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawVisibleDots(event: DrawGridDotsEvent): void {
        const dots = event.dots;
        this.rasterVirtualDrawing.drawDots(dots);
    }

    private handleDrawVisibleThreads(event: DrawGridThreadsEvent): void {
        const threads = event.threads;

        threads.forEach((thread) => {
            this.vectorVirtualDrawing.drawLine(thread.id, thread);
            this.threads.set(thread.id, thread);
        });
    }

    private handleRedraw(): void {
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        const bounds = event.bounds;
        super.bounds = bounds;

        this.rasterVirtualDrawing.bounds = bounds;
        this.vectorVirtualDrawing.bounds = bounds;
    }

    private clear(): void {
        this.rasterVirtualDrawing.clear();

        this.threads.forEach((thread) => {
            this.vectorVirtualDrawing.removeLine(thread.id);
        });
    }
}