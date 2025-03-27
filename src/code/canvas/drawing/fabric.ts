import assert from "../../asserts/assert.js";
import { CanvasBase } from "../base.js";
import { BoundsChangeEvent } from "../types.js";
import { IFabricDrawingCanvas, IRasterDrawingCanvas } from "./types.js";
import { Density, DrawFabricDotsEvent, DrawFabricThreadsEvent, IFabricCanvas } from "../virtual/types.js";

export class FabricDrawingCanvas extends CanvasBase implements IFabricDrawingCanvas {
    private readonly fabricCanvas: IFabricCanvas;
    private readonly rasterDrawing: IRasterDrawingCanvas;

    constructor(fabricCanvas: IFabricCanvas, rasterDrawing: IRasterDrawingCanvas) {
        super();

        this.fabricCanvas = fabricCanvas;
        assert.isDefined(this.fabricCanvas, "fabricCanvas");

        this.rasterDrawing = rasterDrawing;
        assert.isDefined(this.rasterDrawing, "rasterDrawing");

        this.subscribe();
    }

    public override dispose(): void {
        this.throwIfDisposed();
        this.clear();
        super.dispose();
    }

    private handleDrawDots(event: DrawFabricDotsEvent): void {
        this.throwIfDisposed();

        this.rasterDrawing.drawDots(event.dots);
    }

    private handleDrawThreads(event: DrawFabricThreadsEvent): void {
        this.throwIfDisposed();

        const density = Density.Low;
        this.rasterDrawing.drawLines(event.threads, density);
    }

    private handleRedraw(): void {
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        this.throwIfDisposed();

        const bounds = event.bounds;
        super.bounds = bounds;

        this.rasterDrawing.bounds = bounds;
    }

    private async handleMoveStart(): Promise<void> {
        this.throwIfDisposed();

        const bitmap = await this.rasterDrawing.createBitMap();
        this.clear();

        this.rasterDrawing.drawBitMap(bitmap);
    }

    private handleMoveStop(): void {
        this.clear();
    }

    private clear(): void {
        this.throwIfDisposed();
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