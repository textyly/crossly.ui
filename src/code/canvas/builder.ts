import { CrosslyCanvas } from "./crossly.js";
import { InputCanvas } from "./input/input.js";
import { IInputCanvas } from "./input/types.js";
import { CueDrawingCanvas } from "./drawing/cue.js";
import { GridDrawingCanvas } from "./drawing/grid.js";
import { RasterDrawingCanvas } from "./drawing/raster.js";
import { VectorDrawingCanvas } from "./drawing/vector.js";
import { StitchDrawingCanvas } from "./drawing/stitch.js";
import { InputCanvasThrottler } from "./input/throttler.js";
import { CrosslyCanvasConfig, ICrosslyCanvas } from "./types.js";
import { ICueDrawingCanvas, IGridDrawingCanvas, IStitchDrawingCanvas } from "./drawing/types.js";

export class CrosslyCanvasBuilder {
    private config!: CrosslyCanvasConfig;
    private inputCanvas!: IInputCanvas;
    private gridDrawingCanvas!: IGridDrawingCanvas;
    private stitchDrawingCanvas!: IStitchDrawingCanvas;
    private cueDrawingCanvas!: ICueDrawingCanvas;

    public build(): ICrosslyCanvas {
        const crosslyCanvas = new CrosslyCanvas(this.config, this.inputCanvas, this.gridDrawingCanvas, this.stitchDrawingCanvas, this.cueDrawingCanvas);
        return crosslyCanvas;
    }

    public withConfig(config: CrosslyCanvasConfig): CrosslyCanvasBuilder {
        this.config = config;
        return this;
    }

    public withInputCanvas(inputElement: HTMLElement): CrosslyCanvasBuilder {
        const inputCanvas = new InputCanvas(inputElement);
        const inputCanvasThrottler = new InputCanvasThrottler(inputCanvas);
        this.inputCanvas = inputCanvas;
        return this;
    }

    public withGridCanvas(gridDotsCanvasElement: HTMLCanvasElement, gridThreadsSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const rasterDrawingCanvas = new RasterDrawingCanvas(gridDotsCanvasElement);
        this.gridDrawingCanvas = new GridDrawingCanvas(rasterDrawingCanvas);
        return this;
    }

    public withStitchCanvas(stitchCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        const rasterDrawingCanvas = new RasterDrawingCanvas(stitchCanvasElement);
        this.stitchDrawingCanvas = new StitchDrawingCanvas(rasterDrawingCanvas);
        return this;
    }

    public withCueCanvas(cueSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const vectorDrawingCanvas = new VectorDrawingCanvas(cueSvgElement);
        this.cueDrawingCanvas = new CueDrawingCanvas(vectorDrawingCanvas);
        return this;
    }
}