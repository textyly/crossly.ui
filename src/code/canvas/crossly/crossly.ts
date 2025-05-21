import { ICrosslyCanvas } from "../types.js";
import { CrosslyCanvasBase } from "./base.js";
import { IInputCanvas } from "../input/types.js";
import { FrontCueDrawingCanvas } from "../drawing/front/cue.js";
import { FabricDrawingCanvas } from "../drawing/fabric.js";
import { StitchDrawingCanvas } from "../drawing/stitch.js";
import { CueCanvasFacade } from "../virtual/cue/facade.js";
import { CrosslyCanvasConfig } from "../../config/types.js";
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
import { BackCueDrawingCanvas } from "../drawing/back/cue.js";

export abstract class CrosslyCanvas extends CrosslyCanvasBase implements ICrosslyCanvas {
    private readonly inputCanvas: IInputCanvas;
    protected readonly configuration: CrosslyCanvasConfig;

    protected fabricCanvasFacade!: IFabricCanvasFacade;
    private fabricDrawingCanvas!: IFabricDrawingCanvas;
    private fabricRasterDrawing!: IFabricRasterDrawingCanvas;

    protected stitchCanvasFacade!: IStitchCanvasFacade;
    private stitchDrawingCanvas!: IStitchDrawingCanvas;
    private stitchRasterDrawing!: IStitchRasterDrawingCanvas;

    protected cueCanvasFacade!: ICueCanvasFacade;
    private cueDrawingCanvas!: ICueDrawingCanvas;
    private cueVectorDrawing!: IVectorDrawingCanvas;

    private backCueDrawingCanvas!: ICueDrawingCanvas;
    private backCueVectorDrawing!: IVectorDrawingCanvas;

    protected _name: string;

    constructor(
        name: string,
        config: CrosslyCanvasConfig,
        inputCanvas: IInputCanvas,
        fabricRasterDrawing: IFabricRasterDrawingCanvas,
        stitchRasterDrawing: IStitchRasterDrawingCanvas,
        cueVectorDrawing: IVectorDrawingCanvas,
        backCueVectorDrawing: IVectorDrawingCanvas) {

        super(CrosslyCanvas.name);

        this._name = name;
        this.configuration = config;
        this.inputCanvas = inputCanvas;

        this.initializeFabricCanvas(fabricRasterDrawing);
        this.initializeStitchCanvas(stitchRasterDrawing);
        this.initializeCueCanvas(cueVectorDrawing, backCueVectorDrawing);

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

    private initializeFabricCanvas(fabricRasterDrawing: IFabricRasterDrawingCanvas): void {
        this.fabricRasterDrawing = fabricRasterDrawing;
        this.fabricCanvasFacade = new FabricCanvasFacade(this.configuration.fabric, this.inputCanvas);
        this.fabricDrawingCanvas = new FabricDrawingCanvas(this.fabricCanvasFacade, this.fabricRasterDrawing);
    }

    private initializeStitchCanvas(stitchRasterDrawing: IStitchRasterDrawingCanvas): void {
        this.stitchRasterDrawing = stitchRasterDrawing;
        this.stitchCanvasFacade = new StitchCanvasFacade(this.configuration.stitch, this.inputCanvas);
        this.stitchDrawingCanvas = new StitchDrawingCanvas(this.stitchCanvasFacade, this.stitchRasterDrawing);
    }

    private initializeCueCanvas(cueVectorDrawing: IVectorDrawingCanvas, backCueVectorDrawing: IVectorDrawingCanvas): void {
        this.cueVectorDrawing = cueVectorDrawing;
        this.backCueVectorDrawing = backCueVectorDrawing;

        this.cueCanvasFacade = new CueCanvasFacade(this.configuration.cue, this.inputCanvas);
        this.cueDrawingCanvas = new FrontCueDrawingCanvas(this.cueCanvasFacade, this.cueVectorDrawing);
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
        this.cueDrawingCanvas.dispose();
        this.cueVectorDrawing.dispose();
    }

    private disposeStitchCanvas(): void {
        this.stitchCanvasFacade.dispose();
        this.stitchDrawingCanvas.dispose();
        this.stitchRasterDrawing.dispose();
    }

    private disposeFabricCanvas(): void {
        this.fabricCanvasFacade.dispose();
        this.fabricDrawingCanvas.dispose();
        this.fabricRasterDrawing.dispose();
    }

    private disposeInputCanvas(): void {
        this.inputCanvas.dispose();
    }
}