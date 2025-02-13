import { CanvasBase } from "../base.js";
import { BoundsChangeEvent } from "../types.js";
import { IFabricDrawingCanvas, IRasterDrawingCanvas} from "./types.js";
import { DrawFabricDotsEvent, DrawFabricThreadsEvent, IFabricCanvas } from "../virtual/types.js";

export class FabricDrawingCanvas extends CanvasBase implements IFabricDrawingCanvas {
    private readonly rasterDrawing: IRasterDrawingCanvas;

    constructor(rasterDrawing: IRasterDrawingCanvas) {
        super();
        this.rasterDrawing = rasterDrawing;
    }

    public subscribe(fabricCanvas: IFabricCanvas): void {
        const drawDotsUn = fabricCanvas.onDrawDots(this.handleDrawDots.bind(this));
        super.registerUn(drawDotsUn);

        const drawThreadsUn = fabricCanvas.onDrawThreads(this.handleDrawThreads.bind(this));
        super.registerUn(drawThreadsUn);

        const redrawUn = fabricCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const boundsChangeUn = fabricCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawDots(event: DrawFabricDotsEvent): void {
        this.rasterDrawing.drawDots(event.dotsX, event.dotsY, event.dotRadius, event.dotColor);
    }

    private handleDrawThreads(event: DrawFabricThreadsEvent): void {
        const threads = event.threads;
        this.rasterDrawing.drawLines(threads);
    }

    private handleRedraw(): void {
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        const bounds = event.bounds;
        super.bounds = bounds;

        this.rasterDrawing.bounds = bounds;
    }

    private clear(): void {
        this.rasterDrawing.clear();
    }
}