import { CanvasBase } from "./base.js";
import { IInputCanvas } from "./input/types.js";
import { CueCanvas } from "./virtual/cue/cue.js";
import { GridCanvas } from "./virtual/grid/grid.js";
import { StitchCanvas } from "./virtual/stitch/stitch.js";
import { CrosslyCanvasConfig, ICrosslyCanvas, Bounds } from "./types.js";
import { ICueCanvas, IGridCanvas, IStitchCanvas } from "./virtual/types.js";
import { ICueDrawingCanvas, IGridDrawingCanvas, IStitchDrawingCanvas } from "./drawing/types.js";

export class CrosslyCanvas extends CanvasBase implements ICrosslyCanvas {
    private readonly config: Readonly<CrosslyCanvasConfig>;
    private readonly inputCanvas: IInputCanvas;

    private gridCanvas!: IGridCanvas;
    private gridDrawingCanvas!: IGridDrawingCanvas;

    private stitchCanvas!: IStitchCanvas;
    private stitchDrawingCanvas!: IStitchDrawingCanvas;

    private cueCanvas!: ICueCanvas;
    private cueDrawingCanvas!: ICueDrawingCanvas;

    constructor(
        config: CrosslyCanvasConfig,
        inputCanvas: IInputCanvas,
        gridDrawingCanvas: IGridDrawingCanvas,
        stitchDrawingCanvas: IStitchDrawingCanvas,
        cueDrawingCanvas: ICueDrawingCanvas) {

        super();
        this.config = config;
        this.inputCanvas = inputCanvas;
        this.initializeGridCanvas(gridDrawingCanvas);
        this.initializeStitchCanvas(stitchDrawingCanvas);
        this.initializeCueCanvas(cueDrawingCanvas);
    }

    public get configuration(): CrosslyCanvasConfig {
        return this.config;
    }

    public draw(): void {
        this.gridCanvas.draw();
        this.stitchCanvas.draw();
        this.cueCanvas.draw();
    }

    public override dispose(): void {
        this.disposeCueCanvas();
        this.disposeStitchCanvas();
        this.disposeGridCanvas();

        this.inputCanvas?.dispose();

        super.dispose();
    }

    protected override invokeBoundsChange(bounds: Bounds): void {
        super.invokeBoundsChange(bounds);

        this.gridCanvas.bounds = bounds;
        this.stitchCanvas.bounds = bounds;
        this.cueCanvas.bounds = bounds;
        this.inputCanvas.bounds = bounds;
    }

    private initializeGridCanvas(dotDrawingCanvas: IGridDrawingCanvas): void {
        this.gridDrawingCanvas = dotDrawingCanvas;
        this.gridCanvas = new GridCanvas(this.configuration.grid, this.inputCanvas);
        this.gridDrawingCanvas.subscribe(this.gridCanvas);
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

    private disposeGridCanvas(): void {
        this.gridCanvas?.dispose();
        this.gridDrawingCanvas?.dispose();
    }
}