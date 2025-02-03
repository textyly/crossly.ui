import { CrosslyCanvas } from "./crossly.js";
import { InputCanvas } from "./input/input.js";
import { IInputCanvas } from "./input/types.js";
import { CueDrawingCanvas } from "./drawing/cue.js";
import { RasterDrawingCanvas } from "./drawing/raster.js";
import { VectorDrawingCanvas } from "./drawing/vector.js";
import { GridDrawingCanvas } from "./drawing/grid.js";
import { StitchDrawingCanvas } from "./drawing/stitch.js";
import { InputCanvasThrottler } from "./input/throttler.js";
import { CrosslyCanvasConfig, ICrosslyCanvas } from "./types.js";
import { RasterVirtualDrawingCanvas } from "./drawing/virtual/raster.js";
import { VectorVirtualDrawingCanvas } from "./drawing/virtual/vector.js";
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
        this.inputCanvas = inputCanvasThrottler;
        return this;
    }

    public withGridCanvas(gridDotsCanvasElement: HTMLCanvasElement, gridThreadsSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const rasterDrawingCanvas = new RasterDrawingCanvas(gridDotsCanvasElement);
        const rasterVirtualDrawingCanvas = new RasterVirtualDrawingCanvas(rasterDrawingCanvas);

        const vectorDrawingCanvas = new VectorDrawingCanvas(gridThreadsSvgElement);
        const vectorVirtualDrawingCanvas = new VectorVirtualDrawingCanvas(vectorDrawingCanvas);

        this.gridDrawingCanvas = new GridDrawingCanvas(rasterVirtualDrawingCanvas, vectorVirtualDrawingCanvas);
        return this;
    }

    public withStitchCanvas(stitchCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        const rasterDrawingCanvas = new RasterDrawingCanvas(stitchCanvasElement);
        const rasterVirtualDrawingCanvas = new RasterVirtualDrawingCanvas(rasterDrawingCanvas);
        this.stitchDrawingCanvas = new StitchDrawingCanvas(rasterVirtualDrawingCanvas);
        return this;
    }

    public withCueCanvas(cueSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const vectorDrawingCanvas = new VectorDrawingCanvas(cueSvgElement);
        const vectorVirtualDrawingCanvas = new VectorVirtualDrawingCanvas(vectorDrawingCanvas);
        this.cueDrawingCanvas = new CueDrawingCanvas(vectorVirtualDrawingCanvas);
        return this;
    }
}