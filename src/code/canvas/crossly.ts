import { CanvasBase } from "./base.js";
import { IInputCanvas } from "./input/types.js";
import { CueCanvas } from "./virtual/cue/cue.js";
import { FabricCanvas } from "./virtual/fabric/fabric.js";
import { StitchCanvas } from "./virtual/stitch/stitch.js";
import { CrosslyCanvasConfig, ICrosslyCanvas, Bounds } from "./types.js";
import { ICueCanvas, IFabricCanvas, IStitchCanvas } from "./virtual/types.js";
import { ICueDrawingCanvas, IFabricDrawingCanvas, IStitchDrawingCanvas } from "./drawing/types.js";

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
        fabricDrawingCanvas: IFabricDrawingCanvas,
        stitchDrawingCanvas: IStitchDrawingCanvas,
        cueDrawingCanvas: ICueDrawingCanvas) {

        super();
        this.config = config;
        this.inputCanvas = inputCanvas;
        this.initializeFabricCanvas(fabricDrawingCanvas);
        this.initializeStitchCanvas(stitchDrawingCanvas);
        this.initializeCueCanvas(cueDrawingCanvas);
    }

    public get configuration(): CrosslyCanvasConfig {
        return this.config;
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

        this.inputCanvas?.dispose();

        super.dispose();
    }

    protected override invokeBoundsChange(bounds: Bounds): void {
        super.invokeBoundsChange(bounds);

        this.fabricCanvas.bounds = bounds;
        this.stitchCanvas.bounds = bounds;
        this.cueCanvas.bounds = bounds;
        this.inputCanvas.bounds = bounds;
    }

    private initializeFabricCanvas(fabricDrawingCanvas: IFabricDrawingCanvas): void {
        this.fabricDrawingCanvas = fabricDrawingCanvas;
        this.fabricCanvas = new FabricCanvas(this.configuration.fabric, this.inputCanvas);
        this.fabricDrawingCanvas.subscribe(this.fabricCanvas);
    }

    private initializeStitchCanvas(stitchDrawingCanvas: IStitchDrawingCanvas): void {
        this.stitchDrawingCanvas = stitchDrawingCanvas;
        this.stitchCanvas = new StitchCanvas(this.configuration.stitch, this.inputCanvas);
        this.stitchDrawingCanvas.subscribe(this.stitchCanvas);
    }

    private initializeCueCanvas(cueDrawingCanvas: ICueDrawingCanvas): void {
        this.cueDrawingCanvas = cueDrawingCanvas;
        this.cueCanvas = new CueCanvas(this.configuration.cue, this.inputCanvas);
        this.cueDrawingCanvas.subscribe(this.cueCanvas);
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
}