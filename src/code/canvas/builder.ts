import { CrosslyCanvas } from "./crossly.js";
import { InputCanvas } from "./input/input.js";
import { IInputCanvas } from "./input/types.js";
import { CueDrawingCanvas } from "./drawing/cue.js";
import { RasterDrawing } from "./drawing/raster.js";
import { IDrawingCanvas } from "./drawing/types.js";
import { VectorDrawing } from "./drawing/vector.js";
import { GridDrawingCanvas } from "./drawing/grid.js";
import { StitchDrawingCanvas } from "./drawing/stitch.js";
import { CanvasConfig, ICrosslyCanvas } from "./types.js";
import { InputCanvasThrottler } from "./input/throttler.js";
import { ICueCanvas, IGridCanvas, IStitchCanvas } from "./virtual/types.js";

export class CrosslyCanvasBuilder {
    private config!: CanvasConfig;
    private inputCanvas!: IInputCanvas;
    private gridDrawingCanvas!: IDrawingCanvas<IGridCanvas>;
    private stitchDrawingCanvas!: IDrawingCanvas<IStitchCanvas>;
    private cueDrawingCanvas!: IDrawingCanvas<ICueCanvas>;

    public build(): ICrosslyCanvas {
        const crosslyCanvas = new CrosslyCanvas(this.config, this.inputCanvas, this.gridDrawingCanvas, this.stitchDrawingCanvas, this.cueDrawingCanvas);
        return crosslyCanvas;
    }

    public withConfig(config: CanvasConfig): CrosslyCanvasBuilder {
        this.config = config;
        return this;
    }

    public withInputCanvas(inputSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const inputCanvas = new InputCanvas(inputSvgElement);
        const inputCanvasThrottler = new InputCanvasThrottler(inputCanvas);
        this.inputCanvas = inputCanvasThrottler;
        return this;
    }

    public withGridCanvas(gridDotsCanvasElement: HTMLCanvasElement, gridLinesSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const rasterDrawing = new RasterDrawing(gridDotsCanvasElement);
        const vectorDrawing = new VectorDrawing(gridLinesSvgElement);
        this.gridDrawingCanvas = new GridDrawingCanvas(rasterDrawing, vectorDrawing);
        return this;
    }

    public withStitchCanvas(stitchCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        const rasterDrawing = new RasterDrawing(stitchCanvasElement);
        this.stitchDrawingCanvas = new StitchDrawingCanvas(rasterDrawing);
        return this;
    }

    public withCueCanvas(cueSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const vectorDrawing = new VectorDrawing(cueSvgElement);
        this.cueDrawingCanvas = new CueDrawingCanvas(vectorDrawing);
        return this;
    }
}