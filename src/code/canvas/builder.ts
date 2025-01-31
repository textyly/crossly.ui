import { CrosslyCanvas } from "./crossly.js";
import { InputCanvas } from "./input/input.js";
import { IInputCanvas } from "./input/types.js";
import { CueDrawingCanvas } from "./drawing/cue.js";
import { RasterDrawing } from "./drawing/raster.js";
import { VectorDrawing } from "./drawing/vector.js";
import { GridDrawingCanvas } from "./drawing/grid.js";
import { StitchDrawingCanvas } from "./drawing/stitch.js";
import { InputCanvasThrottler } from "./input/throttler.js";
import { CrosslyCanvasConfig, ICrosslyCanvas } from "./types.js";
import { VirtualRasterDrawing } from "./drawing/virtual/raster.js";
import { VirtualVectorDrawing } from "./drawing/virtual/vector.js";
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
        const rasterDrawing = new RasterDrawing(gridDotsCanvasElement);
        const virtualRasterDrawing = new VirtualRasterDrawing(rasterDrawing);

        const vectorDrawing = new VectorDrawing(gridThreadsSvgElement);
        const virtualVectorDrawing = new VirtualVectorDrawing(vectorDrawing);

        this.gridDrawingCanvas = new GridDrawingCanvas(virtualRasterDrawing, virtualVectorDrawing);
        return this;
    }

    public withStitchCanvas(stitchCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        const rasterDrawing = new RasterDrawing(stitchCanvasElement);
        const virtualRasterDrawing = new VirtualRasterDrawing(rasterDrawing);
        this.stitchDrawingCanvas = new StitchDrawingCanvas(virtualRasterDrawing);
        return this;
    }

    public withCueCanvas(cueSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const vectorDrawing = new VectorDrawing(cueSvgElement);
        const virtualVectorDrawing = new VirtualVectorDrawing(vectorDrawing);
        this.cueDrawingCanvas = new CueDrawingCanvas(virtualVectorDrawing);
        return this;
    }
}