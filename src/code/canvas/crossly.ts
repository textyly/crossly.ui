import { CanvasBase } from "./base.js";
import { IInputCanvas } from "./input/types.js";
import { CueDrawingCanvas } from "./drawing/cue.js";
import { FabricCanvas } from "./virtual/fabric/fabric.js";
import { FabricDrawingCanvas } from "./drawing/fabric.js";
import { StitchDrawingCanvas } from "./drawing/stitch.js";
import { CueCanvasFacade } from "./virtual/cue/facade.js";
import { StitchCanvasFacade } from "./virtual/stitch/facade.js";
import { CrosslyCanvasConfig, ICrosslyCanvas } from "./types.js";
import { ICueCanvasFacade, IFabricCanvas, IStitchCanvasFacade } from "./virtual/types.js";
import {
    ICueDrawingCanvas,
    IFabricDrawingCanvas,
    IRasterDrawingCanvas,
    IStitchDrawingCanvas,
    IVectorDrawingCanvas
} from "./drawing/types.js";

export class CrosslyCanvas extends CanvasBase implements ICrosslyCanvas {
    private readonly config: Readonly<CrosslyCanvasConfig>;
    private readonly inputCanvas: IInputCanvas;

    private fabricCanvas!: IFabricCanvas;
    private fabricDrawingCanvas!: IFabricDrawingCanvas;

    private stitchCanvasFacade!: IStitchCanvasFacade;
    private stitchDrawingCanvas!: IStitchDrawingCanvas;

    private cueCanvasFacade!: ICueCanvasFacade;
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
        this.stitchCanvasFacade.draw();
        this.cueCanvasFacade.draw();
    }

    public setThreadColor(color: string): void {
        this.stitchCanvasFacade.setThreadColor(color);
        this.cueCanvasFacade.setThreadColor(color);
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
        this.stitchCanvasFacade = new StitchCanvasFacade(this.config.stitch, this.inputCanvas);
        this.stitchDrawingCanvas = new StitchDrawingCanvas(this.stitchCanvasFacade, rasterDrawing);
    }

    private initializeCueCanvas(vectorDrawing: IVectorDrawingCanvas): void {
        this.cueCanvasFacade = new CueCanvasFacade(this.config.cue, this.inputCanvas);
        this.cueDrawingCanvas = new CueDrawingCanvas(this.cueCanvasFacade, vectorDrawing);
    }

    private disposeCueCanvas(): void {
        this.cueCanvasFacade?.dispose();
        this.cueDrawingCanvas?.dispose();
    }

    private disposeStitchCanvas(): void {
        this.stitchCanvasFacade?.dispose();
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