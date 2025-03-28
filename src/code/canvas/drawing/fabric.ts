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
        assert.defined(this.fabricCanvas, "fabricCanvas");

        this.rasterDrawing = rasterDrawing;
        assert.defined(this.rasterDrawing, "rasterDrawing");

        this.subscribe();
    }

    public override dispose(): void {
        this.ensureAlive();
        this.clear();
        super.dispose();
    }

    private handleDrawDots(event: DrawFabricDotsEvent): void {
        this.ensureAlive();

        this.rasterDrawing.drawDots(event.dots);
    }

    private handleDrawThreads(event: DrawFabricThreadsEvent): void {
        this.ensureAlive();

        const density = Density.Low;
        this.rasterDrawing.drawLines(event.threads, density);
    }

    private handleRedraw(): void {
        this.ensureAlive();
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        this.ensureAlive();

        const bounds = event.bounds;
        super.bounds = bounds;

        this.rasterDrawing.bounds = bounds;
    }

    private async handleMoveStart(): Promise<void> {
        this.ensureAlive();

        const bitmap = await this.rasterDrawing.createBitMap();

        this.ensureAlive();
        assert.defined(bitmap, "bitmap");

        this.clear();

        this.rasterDrawing.drawBitMap(bitmap);
    }

    private handleMoveStop(): void {
        this.ensureAlive();
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