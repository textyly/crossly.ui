import { CrosslyCanvasBase } from "./base.js";
import { IInputCanvas } from "../input/types.js";
import { CueCanvasFacade } from "../virtual/cue/facade.js";
import { CrosslyCanvasConfig } from "../../config/types.js";
import { BackCueDrawingCanvas } from "../drawing/cue/back.js";
import { FrontCueDrawingCanvas } from "../drawing/cue/front.js";
import { FabricCanvasFacade } from "../virtual/fabric/facade.js";
import { StitchCanvasFacade } from "../virtual/stitch/facade.js";
import { FabricDrawingCanvas } from "../drawing/fabric/fabric.js";
import { StitchDrawingCanvas } from "../drawing/stitch/stitch.js";
import { DrawingMode, IBackSideView, ICrosslyCanvas, Visibility } from "../types.js";
import { ICueCanvasFacade, ChangeFabricEvent, IFabricCanvasFacade, IStitchCanvasFacade, ChangeStitchPatternEvent } from "../virtual/types.js";
import {
    ICueDrawingCanvas,
    IFabricDrawingCanvas,
    IStitchDrawingCanvas,
    IVectorDrawingCanvas,
    IFabricRasterDrawingCanvas,
    IStitchRasterDrawingCanvas,
} from "../drawing/types.js";

export abstract class CrosslyCanvas extends CrosslyCanvasBase implements ICrosslyCanvas {
    protected readonly configuration: CrosslyCanvasConfig;
    private readonly inputCanvas: IInputCanvas;
    protected readonly backSideView: IBackSideView;

    protected fabricCanvasFacade!: IFabricCanvasFacade;
    private frontFabricDrawingCanvas!: IFabricDrawingCanvas;
    private backFabricDrawingCanvas!: IFabricDrawingCanvas;
    private frontFabricRasterDrawing!: IFabricRasterDrawingCanvas;
    private backFabricRasterDrawing!: IFabricRasterDrawingCanvas;

    protected stitchCanvasFacade!: IStitchCanvasFacade;
    private frontStitchDrawingCanvas!: IStitchDrawingCanvas;
    private backStitchDrawingCanvas!: IStitchDrawingCanvas;
    private frontStitchRasterDrawing!: IStitchRasterDrawingCanvas;
    private backStitchRasterDrawing!: IStitchRasterDrawingCanvas;

    protected cueCanvasFacade!: ICueCanvasFacade;
    private frontCueDrawingCanvas!: ICueDrawingCanvas;
    private backCueDrawingCanvas!: ICueDrawingCanvas;
    private frontCueVectorDrawing!: IVectorDrawingCanvas;
    private backCueVectorDrawing!: IVectorDrawingCanvas;

    protected backSideViewVisibility: Visibility;

    constructor(
        config: CrosslyCanvasConfig,
        inputCanvas: IInputCanvas,
        backSideView: IBackSideView,
        frontFabricRasterDrawing: IFabricRasterDrawingCanvas,
        backFabricRasterDrawing: IFabricRasterDrawingCanvas,
        frontStitchRasterDrawing: IStitchRasterDrawingCanvas,
        backStitchRasterDrawing: IStitchRasterDrawingCanvas,
        frontCueVectorDrawing: IVectorDrawingCanvas,
        backCueVectorDrawing: IVectorDrawingCanvas) {

        super(CrosslyCanvas.name);

        this.configuration = config;
        this.inputCanvas = inputCanvas;
        this.backSideView = backSideView;

        this.initializeFabricCanvas(frontFabricRasterDrawing, backFabricRasterDrawing);
        this.initializeStitchCanvas(frontStitchRasterDrawing, backStitchRasterDrawing);
        this.initializeCueCanvas(frontCueVectorDrawing, backCueVectorDrawing);

        this.backSideViewVisibility = Visibility.Hidden;

        this.subscribe();
    }

    public override dispose(): void {
        this.ensureAlive();

        super.dispose();

        this.disposeCueCanvas();
        this.disposeStitchCanvas();
        this.disposeFabricCanvas();
        this.disposeInputCanvas();
    }

    protected showBackSideView(): void {
        this.backFabricDrawingCanvas.resume();
        this.backStitchDrawingCanvas.resume();
        this.backCueDrawingCanvas.resume();

        this.backSideView.show();
        this.backSideViewVisibility = Visibility.Visible;
    }

    protected hideBackSideView(): void {
        this.backFabricDrawingCanvas.suspend();
        this.backStitchDrawingCanvas.suspend();
        this.backCueDrawingCanvas.suspend();

        this.backSideView.hide();
        this.backSideViewVisibility = Visibility.Hidden;
    }

    private initializeFabricCanvas(frontFabricRasterDrawing: IFabricRasterDrawingCanvas, backFabricRasterDrawing: IFabricRasterDrawingCanvas): void {
        this.frontFabricRasterDrawing = frontFabricRasterDrawing;
        this.backFabricRasterDrawing = backFabricRasterDrawing;

        this.fabricCanvasFacade = new FabricCanvasFacade(this.configuration.fabric, this.inputCanvas);

        this.frontFabricDrawingCanvas = new FabricDrawingCanvas(this.fabricCanvasFacade, this.frontFabricRasterDrawing, DrawingMode.Draw);
        this.backFabricDrawingCanvas = new FabricDrawingCanvas(this.fabricCanvasFacade, this.backFabricRasterDrawing, DrawingMode.Suspend);
    }

    private initializeStitchCanvas(frontStitchRasterDrawing: IStitchRasterDrawingCanvas, backStitchRasterDrawing: IStitchRasterDrawingCanvas): void {
        this.frontStitchRasterDrawing = frontStitchRasterDrawing;
        this.backStitchRasterDrawing = backStitchRasterDrawing;

        this.stitchCanvasFacade = new StitchCanvasFacade(this.configuration.stitch, this.inputCanvas);

        this.frontStitchDrawingCanvas = new StitchDrawingCanvas(this.stitchCanvasFacade, this.frontStitchRasterDrawing, DrawingMode.Draw);
        this.backStitchDrawingCanvas = new StitchDrawingCanvas(this.stitchCanvasFacade, this.backStitchRasterDrawing, DrawingMode.Suspend);
    }

    private initializeCueCanvas(frontCueVectorDrawing: IVectorDrawingCanvas, backCueVectorDrawing: IVectorDrawingCanvas): void {
        this.frontCueVectorDrawing = frontCueVectorDrawing;
        this.backCueVectorDrawing = backCueVectorDrawing;

        this.cueCanvasFacade = new CueCanvasFacade(this.configuration.cue, this.inputCanvas);

        this.frontCueDrawingCanvas = new FrontCueDrawingCanvas(this.cueCanvasFacade, this.frontCueVectorDrawing, DrawingMode.Draw);
        this.backCueDrawingCanvas = new BackCueDrawingCanvas(this.cueCanvasFacade, this.backCueVectorDrawing, DrawingMode.Suspend);
    }

    private handleChangeFabric(event: ChangeFabricEvent): void {
        this.ensureAlive();

        super.invokeChangeFabric(event.pattern);
    }

    private handleChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        this.ensureAlive();

        super.invokeChangeStitchPattern(event.pattern);
    }

    private handleZoomIn(): void {
        this.ensureAlive();

        super.invokeZoomIn();
    }

    private handleZoomOut(): void {
        this.ensureAlive();

        super.invokeZoomOut();
    }

    private subscribe() {
        const unChangeFabric = this.fabricCanvasFacade.onChange(this.handleChangeFabric.bind(this));
        super.registerUn(unChangeFabric);

        const unChangeStitchPattern = this.stitchCanvasFacade.onChange(this.handleChangeStitchPattern.bind(this));
        super.registerUn(unChangeStitchPattern);

        const unZoomIn = this.stitchCanvasFacade.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(unZoomIn);

        const unZoomOut = this.stitchCanvasFacade.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(unZoomOut);
    }

    private disposeCueCanvas(): void {
        this.frontCueDrawingCanvas.dispose();
        this.backCueDrawingCanvas.dispose();
        this.frontCueVectorDrawing.dispose();
        this.backCueVectorDrawing.dispose();
        this.cueCanvasFacade.dispose();
    }

    private disposeStitchCanvas(): void {
        this.frontStitchDrawingCanvas.dispose();
        this.backStitchDrawingCanvas.dispose();
        this.frontStitchRasterDrawing.dispose();
        this.backStitchRasterDrawing.dispose();
        this.stitchCanvasFacade.dispose
    }

    private disposeFabricCanvas(): void {
        this.frontFabricDrawingCanvas.dispose();
        this.backFabricDrawingCanvas.dispose();
        this.frontFabricRasterDrawing.dispose();
        this.backFabricRasterDrawing.dispose();
        this.fabricCanvasFacade.dispose();
    }

    private disposeInputCanvas(): void {
        this.inputCanvas.dispose();
    }
}