import { CanvasBase } from "./base.js";
import assert from "../asserts/assert.js";
import { ICrosslyCanvas } from "./types.js";
import { IInputCanvas } from "./input/types.js";
import { CueDrawingCanvas } from "./drawing/cue.js";
import { CrosslyCanvasConfig } from "../config/types.js";
import { FabricCanvas } from "./virtual/fabric/fabric.js";
import { FabricDrawingCanvas } from "./drawing/fabric.js";
import { StitchDrawingCanvas } from "./drawing/stitch.js";
import { CueCanvasFacade } from "./virtual/cue/facade.js";
import { StitchCanvasFacade } from "./virtual/stitch/facade.js";
import { ICueCanvasFacade, IFabricCanvas, IStitchCanvasFacade } from "./virtual/types.js";
import {
    ICueDrawingCanvas,
    IFabricDrawingCanvas,
    IRasterDrawingCanvas,
    IStitchDrawingCanvas,
    IVectorDrawingCanvas
} from "./drawing/types.js";

export abstract class CrosslyCanvas extends CanvasBase implements ICrosslyCanvas {
    private readonly config: Readonly<CrosslyCanvasConfig>;
    private readonly inputCanvas: IInputCanvas;

    protected fabricCanvas!: IFabricCanvas;
    private fabricDrawingCanvas!: IFabricDrawingCanvas;

    protected stitchCanvasFacade!: IStitchCanvasFacade;
    private stitchDrawingCanvas!: IStitchDrawingCanvas;

    protected cueCanvasFacade!: ICueCanvasFacade;
    private cueDrawingCanvas!: ICueDrawingCanvas;

    private disposed: boolean;
    private disposedErrMsg: string;

    constructor(
        config: CrosslyCanvasConfig,
        inputCanvas: IInputCanvas,
        fabricRasterDrawing: IRasterDrawingCanvas,
        stitchRasterDrawing: IRasterDrawingCanvas,
        cueVectorDrawing: IVectorDrawingCanvas) {

        super();

        this.config = config;
        assert.isDefined(this.config, "config");

        this.inputCanvas = inputCanvas;
        assert.isDefined(this.inputCanvas, "inputCanvas");

        this.initializeFabricCanvas(fabricRasterDrawing);
        this.initializeStitchCanvas(stitchRasterDrawing);
        this.initializeCueCanvas(cueVectorDrawing);

        this.disposed = false;
        this.disposedErrMsg = `${CrosslyCanvas.name} instance disposed.`;
    }

    public draw(): void {
        assert.that(!this.disposed, this.disposedErrMsg);

        this.fabricCanvas.draw();
        this.stitchCanvasFacade.draw();
        this.cueCanvasFacade.draw();
    }

    public override dispose(): void {
        assert.that(!this.disposed, this.disposedErrMsg);

        this.disposeCueCanvas();
        this.disposeStitchCanvas();
        this.disposeFabricCanvas();
        this.disposeInputCanvas();
        super.dispose();
        this.disposed = true;
    }

    private initializeFabricCanvas(rasterDrawing: IRasterDrawingCanvas): void {
        assert.isDefined(rasterDrawing, "rasterDrawing");
        this.fabricCanvas = new FabricCanvas(this.config.fabric, this.inputCanvas);
        this.fabricDrawingCanvas = new FabricDrawingCanvas(this.fabricCanvas, rasterDrawing);
    }

    private initializeStitchCanvas(rasterDrawing: IRasterDrawingCanvas): void {
        assert.isDefined(rasterDrawing, "rasterDrawing");
        this.stitchCanvasFacade = new StitchCanvasFacade(this.config.stitch, this.inputCanvas);
        this.stitchDrawingCanvas = new StitchDrawingCanvas(this.stitchCanvasFacade, rasterDrawing);
    }

    private initializeCueCanvas(vectorDrawing: IVectorDrawingCanvas): void {
        assert.isDefined(vectorDrawing, "vectorDrawing");
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