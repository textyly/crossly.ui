import { CanvasBase } from "./base.js";
import { IInputCanvas } from "./input/types.js";
import { CueCanvas } from "./virtual/cue/cue.js";
import { FabricCanvas } from "./virtual/fabric/fabric.js";
import { StitchCanvas } from "./virtual/stitch/stitch.js";
import { CrosslyCanvasConfig, ICrosslyCanvas, Bounds } from "./types.js";
import { ICueCanvas, IFabricCanvas, IStitchCanvas } from "./virtual/types.js";
import { ICueDrawingCanvas, IFabricDrawingCanvas, IRasterDrawingCanvas, IStitchDrawingCanvas, IVectorDrawingCanvas } from "./drawing/types.js";
import { FabricDrawingCanvas } from "./drawing/fabric.js";
import { StitchDrawingCanvas } from "./drawing/stitch.js";
import { CueDrawingCanvas } from "./drawing/cue.js";

export class CrosslyCanvas extends CanvasBase implements ICrosslyCanvas {
    private readonly config: Readonly<CrosslyCanvasConfig>;
    private readonly inputCanvas: IInputCanvas;

    private fabricCanvas!: IFabricCanvas;
    private fabricDrawingCanvas!: IFabricDrawingCanvas;

    private stitchCanvas!: IStitchCanvas;
    private stitchDrawingCanvas!: IStitchDrawingCanvas;

    private cueCanvas!: ICueCanvas;
    private cueDrawingCanvas!: ICueDrawingCanvas;

    constructor(
        config: CrosslyCanvasConfig,
        inputCanvas: IInputCanvas,
        fabricRasterDrawing: IRasterDrawingCanvas,
        stitchRasterDrawing: IRasterDrawingCanvas,
        cueVectorDrawing: IVectorDrawingCanvas) {

        super();
        this.config = config;
        this.inputCanvas = inputCanvas;

        this.initializeFabricCanvas(fabricRasterDrawing);
        this.initializeStitchCanvas(stitchRasterDrawing);
        this.initializeCueCanvas(cueVectorDrawing);
    }

    public draw(): void {
        this.fabricCanvas.draw();
        this.stitchCanvas.draw();
        this.cueCanvas.draw();
    }

    public override dispose(): void {
        this.disposeCueCanvas();
        this.disposeStitchCanvas();
        this.disposeFabricCanvas();
        this.disposeInputCanvas();
        super.dispose();
    }

    private initializeFabricCanvas(rasterDrawing: IRasterDrawingCanvas): void {
        this.fabricCanvas = new FabricCanvas(this.config.fabric, this.inputCanvas);
        this.fabricDrawingCanvas = new FabricDrawingCanvas(this.fabricCanvas, rasterDrawing);
    }

    private initializeStitchCanvas(rasterDrawing: IRasterDrawingCanvas): void {
        this.stitchCanvas = new StitchCanvas(this.config.stitch, this.inputCanvas);
        this.stitchDrawingCanvas = new StitchDrawingCanvas(this.stitchCanvas, rasterDrawing);
    }

    private initializeCueCanvas(vectorDrawing: IVectorDrawingCanvas): void {
        this.cueCanvas = new CueCanvas(this.config.cue, this.inputCanvas);
        this.cueDrawingCanvas = new CueDrawingCanvas(this.cueCanvas, vectorDrawing);
    }

    private disposeCueCanvas(): void {
        this.cueCanvas?.dispose();
        this.cueDrawingCanvas?.dispose();
    }

    private disposeStitchCanvas(): void {
        this.stitchCanvas?.dispose();
        this.stitchDrawingCanvas?.dispose();
    }

    private disposeFabricCanvas(): void {
        this.fabricCanvas?.dispose();
        this.fabricDrawingCanvas?.dispose();
    }

    private disposeInputCanvas(): void {
        this.inputCanvas?.dispose();
    }
}