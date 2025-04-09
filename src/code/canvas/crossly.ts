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
    private fabricRasterDrawing!: IRasterDrawingCanvas;

    protected stitchCanvasFacade!: IStitchCanvasFacade;
    private stitchDrawingCanvas!: IStitchDrawingCanvas;
    private stitchRasterDrawing!: IRasterDrawingCanvas;

    protected cueCanvasFacade!: ICueCanvasFacade;
    private cueDrawingCanvas!: ICueDrawingCanvas;
    private cueVectorDrawing!: IVectorDrawingCanvas;

    constructor(
        config: CrosslyCanvasConfig,
        inputCanvas: IInputCanvas,
        fabricRasterDrawing: IRasterDrawingCanvas,
        stitchRasterDrawing: IRasterDrawingCanvas,
        cueVectorDrawing: IVectorDrawingCanvas) {

        super();

        this.config = config;
        assert.defined(this.config, "CrosslyCanvasConfig");

        this.inputCanvas = inputCanvas;
        assert.defined(this.inputCanvas, "inputCanvas");

        this.initializeFabricCanvas(fabricRasterDrawing);
        this.initializeStitchCanvas(stitchRasterDrawing);
        this.initializeCueCanvas(cueVectorDrawing);
    }

    public draw(): void {
        this.ensureAlive();

        this.fabricCanvas.draw();
        this.stitchCanvasFacade.draw();
        this.cueCanvasFacade.draw();
    }

    public override dispose(): void {
        this.ensureAlive();

        this.disposeCueCanvas();
        this.disposeStitchCanvas();
        this.disposeFabricCanvas();
        this.disposeInputCanvas();

        super.dispose();
    }

    private initializeFabricCanvas(fabricRasterDrawing: IRasterDrawingCanvas): void {
        assert.defined(fabricRasterDrawing, "fabricRasterDrawing");

        this.fabricRasterDrawing = fabricRasterDrawing;
        this.fabricCanvas = new FabricCanvas(this.config.fabric, this.inputCanvas);
        this.fabricDrawingCanvas = new FabricDrawingCanvas(this.fabricCanvas, this.fabricRasterDrawing);
    }

    private initializeStitchCanvas(stitchRasterDrawing: IRasterDrawingCanvas): void {
        assert.defined(stitchRasterDrawing, "stitchRasterDrawing");

        this.stitchRasterDrawing = stitchRasterDrawing;
        this.stitchCanvasFacade = new StitchCanvasFacade(this.config.stitch, this.inputCanvas);
        this.stitchDrawingCanvas = new StitchDrawingCanvas(this.stitchCanvasFacade, this.stitchRasterDrawing);
    }

    private initializeCueCanvas(curVectorDrawing: IVectorDrawingCanvas): void {
        assert.defined(curVectorDrawing, "curVectorDrawing");

        this.cueVectorDrawing = curVectorDrawing;
        this.cueCanvasFacade = new CueCanvasFacade(this.config.cue, this.inputCanvas);
        this.cueDrawingCanvas = new CueDrawingCanvas(this.cueCanvasFacade, this.cueVectorDrawing);
    }

    private disposeCueCanvas(): void {
        this.cueCanvasFacade.dispose();
        this.cueDrawingCanvas.dispose();
        this.cueVectorDrawing.dispose();
    }

    private disposeStitchCanvas(): void {
        this.stitchCanvasFacade.dispose();
        this.stitchDrawingCanvas.dispose();
        this.stitchRasterDrawing.dispose();
    }

    private disposeFabricCanvas(): void {
        this.fabricCanvas.dispose();
        this.fabricDrawingCanvas.dispose();
        this.fabricRasterDrawing.dispose();
    }

    private disposeInputCanvas(): void {
        this.inputCanvas.dispose();
    }
}