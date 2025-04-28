import { ICrosslyCanvas } from "../types.js";
import { IInputCanvas } from "../input/types.js";
import { CueDrawingCanvas } from "../drawing/cue.js";
import { CrosslyCanvasBase } from "./base.js";
import { CrosslyCanvasConfig } from "../../config/types.js";
import { FabricCanvas } from "../virtual/fabric/fabric.js";
import { FabricDrawingCanvas } from "../drawing/fabric.js";
import { StitchDrawingCanvas } from "../drawing/stitch.js";
import { CueCanvasFacade } from "../virtual/cue/facade.js";
import { StitchCanvasFacade } from "../virtual/stitch/facade.js";
import { ChangeFabricEvent, ChangeStitchPatternEvent, ICueCanvasFacade, IFabricCanvas, IStitchCanvasFacade } from "../virtual/types.js";
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

    protected fabricCanvas!: IFabricCanvas;
    private fabricDrawingCanvas!: IFabricDrawingCanvas;
    private fabricRasterDrawing!: IFabricRasterDrawingCanvas;

    protected stitchCanvasFacade!: IStitchCanvasFacade;
    private stitchDrawingCanvas!: IStitchDrawingCanvas;
    private stitchRasterDrawing!: IStitchRasterDrawingCanvas;

    protected cueCanvasFacade!: ICueCanvasFacade;
    private cueDrawingCanvas!: ICueDrawingCanvas;
    private cueVectorDrawing!: IVectorDrawingCanvas;

    constructor(
        className: string,
        config: CrosslyCanvasConfig,
        inputCanvas: IInputCanvas,
        fabricRasterDrawing: IFabricRasterDrawingCanvas,
        stitchRasterDrawing: IStitchRasterDrawingCanvas,
        cueVectorDrawing: IVectorDrawingCanvas) {

        super(className, config);

        this.inputCanvas = inputCanvas;

        this.initializeFabricCanvas(fabricRasterDrawing);
        this.initializeStitchCanvas(stitchRasterDrawing);
        this.initializeCueCanvas(cueVectorDrawing);

        this.subscribe();
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

    private initializeFabricCanvas(fabricRasterDrawing: IFabricRasterDrawingCanvas): void {
        this.fabricRasterDrawing = fabricRasterDrawing;
        this.fabricCanvas = new FabricCanvas(this.config.fabric, this.inputCanvas);
        this.fabricDrawingCanvas = new FabricDrawingCanvas(this.fabricCanvas, this.fabricRasterDrawing);
    }

    private initializeStitchCanvas(stitchRasterDrawing: IStitchRasterDrawingCanvas): void {
        this.stitchRasterDrawing = stitchRasterDrawing;
        this.stitchCanvasFacade = new StitchCanvasFacade(this.config.stitch, this.inputCanvas);
        this.stitchDrawingCanvas = new StitchDrawingCanvas(this.stitchCanvasFacade, this.stitchRasterDrawing);
    }

    private initializeCueCanvas(curVectorDrawing: IVectorDrawingCanvas): void {
        this.cueVectorDrawing = curVectorDrawing;
        this.cueCanvasFacade = new CueCanvasFacade(this.config.cue, this.inputCanvas);
        this.cueDrawingCanvas = new CueDrawingCanvas(this.cueCanvasFacade, this.cueVectorDrawing);
    }

    private handleChangeFabric(event: ChangeFabricEvent): void {
        super.invokeChangeFabric(event.fabric);
    }

    private handleChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        super.invokeChangeStitchPattern(event.pattern);
    }

    private subscribe() {
        const unChangeFabric = this.fabricCanvas.onChange(this.handleChangeFabric.bind(this));
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
        this.fabricCanvas.dispose();
        this.fabricDrawingCanvas.dispose();
        this.fabricRasterDrawing.dispose();
    }

    private disposeInputCanvas(): void {
        this.inputCanvas.dispose();
    }
}