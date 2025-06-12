import { CanvasBase } from "../../base.js";
import assert from "../../../asserts/assert.js";
import { BoundsChangeEvent } from "../../types.js";
import { IFabricDrawingCanvas, IFabricRasterDrawingCanvas } from "../types.js";
import { DrawFabricBackgroundEvent, DrawFabricDotsEvent, DrawFabricThreadsEvent, IFabricCanvas } from "../../virtual/types.js";

export class FabricDrawingCanvas extends CanvasBase implements IFabricDrawingCanvas {
    private readonly fabricCanvas: IFabricCanvas;
    private readonly rasterDrawing: IFabricRasterDrawingCanvas;

    constructor(fabricCanvas: IFabricCanvas, rasterDrawing: IFabricRasterDrawingCanvas) {
        super(FabricDrawingCanvas.name);

        this.fabricCanvas = fabricCanvas;
        this.rasterDrawing = rasterDrawing;

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

        this.rasterDrawing.drawLines(event.threads);
    }

    private handleDrawBackground(event: DrawFabricBackgroundEvent): void {
        this.ensureAlive();

        this.rasterDrawing.drawBackgroundColor(event.color);
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

        const drawBackgroundUn = this.fabricCanvas.onDrawBackground(this.handleDrawBackground.bind(this));
        super.registerUn(drawBackgroundUn);

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