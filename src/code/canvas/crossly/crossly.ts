import { ICrosslyCanvas } from "../types.js";
import { CrosslyCanvasBase } from "./base.js";
import { IInputCanvas } from "../input/types.js";
import { FabricDrawingCanvas } from "../drawing/fabric.js";
import { StitchDrawingCanvas } from "../drawing/stitch.js";
import { CueCanvasFacade } from "../virtual/cue/facade.js";
import { CrosslyCanvasConfig } from "../../config/types.js";
import { BackCueDrawingCanvas } from "../drawing/back/cue.js";
import { FrontCueDrawingCanvas } from "../drawing/front/cue.js";
import { FabricCanvasFacade } from "../virtual/fabric/facade.js";
import { StitchCanvasFacade } from "../virtual/stitch/facade.js";
import {
    ICueCanvasFacade,
    ChangeFabricEvent,
    IFabricCanvasFacade,
    IStitchCanvasFacade,
    ChangeStitchPatternEvent,
} from "../virtual/types.js";
import {
    ICueDrawingCanvas,
    IFabricDrawingCanvas,
    IStitchDrawingCanvas,
    IVectorDrawingCanvas,
    IFabricRasterDrawingCanvas,
    IStitchRasterDrawingCanvas,
} from "../drawing/types.js";

export abstract class CrosslyCanvas extends CrosslyCanvasBase implements ICrosslyCanvas {
    private readonly inputCanvas: IInputCanvas;
    protected readonly configuration: CrosslyCanvasConfig;

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

    protected _name: string;

    constructor(
        name: string,
        config: CrosslyCanvasConfig,
        inputCanvas: IInputCanvas,
        frontFabricRasterDrawing: IFabricRasterDrawingCanvas,
        backFabricRasterDrawing: IFabricRasterDrawingCanvas,
        frontStitchRasterDrawing: IStitchRasterDrawingCanvas,
        backStitchRasterDrawing: IStitchRasterDrawingCanvas,
        frontCueVectorDrawing: IVectorDrawingCanvas,
        backCueVectorDrawing: IVectorDrawingCanvas) {

        super(CrosslyCanvas.name);

        this._name = name;
        this.configuration = config;
        this.inputCanvas = inputCanvas;

        this.initializeFabricCanvas(frontFabricRasterDrawing, backFabricRasterDrawing);
        this.initializeStitchCanvas(frontStitchRasterDrawing, backStitchRasterDrawing);
        this.initializeCueCanvas(frontCueVectorDrawing, backCueVectorDrawing);

        this.subscribe();
    }

    public override dispose(): void {
        this.ensureAlive();

        this.disposeCueCanvas();
        this.disposeStitchCanvas();
        this.disposeFabricCanvas();
        this.disposeInputCanvas();

        super.dispose();
    }

    private initializeFabricCanvas(frontFabricRasterDrawing: IFabricRasterDrawingCanvas, backFabricRasterDrawing: IFabricRasterDrawingCanvas): void {
        this.frontFabricRasterDrawing = frontFabricRasterDrawing;
        this.backFabricRasterDrawing = backFabricRasterDrawing;

        this.fabricCanvasFacade = new FabricCanvasFacade(this.configuration.fabric, this.inputCanvas);

        this.frontFabricDrawingCanvas = new FabricDrawingCanvas(this.fabricCanvasFacade, this.frontFabricRasterDrawing);
        this.backFabricDrawingCanvas = new FabricDrawingCanvas(this.fabricCanvasFacade, this.backFabricRasterDrawing);
    }

    private initializeStitchCanvas(frontStitchRasterDrawing: IStitchRasterDrawingCanvas, backStitchRasterDrawing: IStitchRasterDrawingCanvas): void {
        this.frontStitchRasterDrawing = frontStitchRasterDrawing;
        this.backStitchRasterDrawing = backStitchRasterDrawing;

        this.stitchCanvasFacade = new StitchCanvasFacade(this.configuration.stitch, this.inputCanvas);

        this.frontStitchDrawingCanvas = new StitchDrawingCanvas(this.stitchCanvasFacade, this.frontStitchRasterDrawing);
        this.backStitchDrawingCanvas = new StitchDrawingCanvas(this.stitchCanvasFacade, this.backStitchRasterDrawing);
    }

    private initializeCueCanvas(frontCueVectorDrawing: IVectorDrawingCanvas, backCueVectorDrawing: IVectorDrawingCanvas): void {
        this.frontCueVectorDrawing = frontCueVectorDrawing;
        this.backCueVectorDrawing = backCueVectorDrawing;

        this.cueCanvasFacade = new CueCanvasFacade(this.configuration.cue, this.inputCanvas);

        this.frontCueDrawingCanvas = new FrontCueDrawingCanvas(this.cueCanvasFacade, this.frontCueVectorDrawing);
        this.backCueDrawingCanvas = new BackCueDrawingCanvas(this.cueCanvasFacade, this.backCueVectorDrawing);
    }

    private handleChangeFabric(event: ChangeFabricEvent): void {
        this.ensureAlive();

        super.invokeChangeFabric(event.pattern);
    }

    private handleChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        this.ensureAlive();

        super.invokeChangeStitchPattern(event.pattern);
    }

    private subscribe() {
        const unChangeFabric = this.fabricCanvasFacade.onChange(this.handleChangeFabric.bind(this));
        super.registerUn(unChangeFabric);

        const unChangeStitchPattern = this.stitchCanvasFacade.onChange(this.handleChangeStitchPattern.bind(this));
        super.registerUn(unChangeStitchPattern);
    }

    private disposeCueCanvas(): void {
        this.cueCanvasFacade.dispose();
        this.frontCueDrawingCanvas.dispose();
        this.backCueDrawingCanvas.dispose();
        this.frontCueVectorDrawing.dispose();
        this.backCueVectorDrawing.dispose();
    }

    private disposeStitchCanvas(): void {
        this.stitchCanvasFacade.dispose();
        this.frontStitchDrawingCanvas.dispose();
        this.backStitchDrawingCanvas.dispose();
        this.frontStitchRasterDrawing.dispose();
        this.backStitchRasterDrawing.dispose();
    }

    private disposeFabricCanvas(): void {
        this.fabricCanvasFacade.dispose();
        this.frontFabricDrawingCanvas.dispose();
        this.backFabricDrawingCanvas.dispose();
        this.frontFabricRasterDrawing.dispose();
        this.backFabricRasterDrawing.dispose();
    }

    private disposeInputCanvas(): void {
        this.inputCanvas.dispose();
    }
}