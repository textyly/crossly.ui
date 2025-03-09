import { CanvasBase } from "../base.js";
import { BoundsChangeEvent } from "../types.js";
import { IFabricDrawingCanvas, IRasterDrawingCanvas } from "./types.js";
import { DrawFabricDotsEvent, DrawFabricThreadsEvent, IFabricCanvas } from "../virtual/types.js";

export class FabricDrawingCanvas extends CanvasBase implements IFabricDrawingCanvas {
    private readonly fabricCanvas: IFabricCanvas;
    private readonly rasterDrawing: IRasterDrawingCanvas;

    constructor(fabricCanvas: IFabricCanvas, rasterDrawing: IRasterDrawingCanvas) {
        super();
        this.rasterDrawing = rasterDrawing;
        this.fabricCanvas = fabricCanvas;

        this.subscribe();
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawDots(event: DrawFabricDotsEvent): void {
        this.rasterDrawing.drawDots(event.dots);
    }

    private handleDrawThreads(event: DrawFabricThreadsEvent): void {
        this.rasterDrawing.drawLines(event.threads);
    }

    private handleRedraw(): void {
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        const bounds = event.bounds;
        super.bounds = bounds;

        this.rasterDrawing.bounds = bounds;
    }

    private async handleMoveStart(): Promise<void> {
        const bitmap = await this.rasterDrawing.createBitMap();
        this.clear();

        requestAnimationFrame(() => {
            this.rasterDrawing.drawBitMap(bitmap);
        });
    }

    private handleMoveStop(): void {
        this.clear();
    }

    private clear(): void {
        this.rasterDrawing.clear();
    }

    private subscribe(): void {
        const drawDotsUn = this.fabricCanvas.onDrawDots(this.handleDrawDots.bind(this));
        super.registerUn(drawDotsUn);

        const drawThreadsUn = this.fabricCanvas.onDrawThreads(this.handleDrawThreads.bind(this));
        super.registerUn(drawThreadsUn);

        const redrawUn = this.fabricCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const boundsChangeUn = this.fabricCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);

        const moveStartUn = this.fabricCanvas.onMoveStart(this.handleMoveStart.bind(this));
        super.registerUn(moveStartUn);

        const moveStopUn = this.fabricCanvas.onMoveStop(this.handleMoveStop.bind(this));
        super.registerUn(moveStopUn);
    }
}