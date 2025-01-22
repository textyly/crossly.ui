import { ICrosslyCanvas } from "./types.js";
import { CrosslyCanvas } from "./crossly.js";
import { InputCanvas } from "./input/input.js";
import { IInputCanvas } from "./input/types.js";
import { CueDrawingCanvas } from "./drawing/cue.js";
import { GirdDrawingCanvas } from "./drawing/grid.js";
import { RasterDrawing } from "./drawing/raster.js";
import { IDrawingCanvas } from "./drawing/types.js";
import { VectorDrawing } from "./drawing/vector.js";
import { StitchDrawingCanvas } from "./drawing/stitch.js";
import { InputCanvasThrottler } from "./input/throttler.js";
import { ICueCanvas, IGridCanvas, IStitchCanvas } from "./virtual/types.js";

export class CrosslyCanvasBuilder {
    private inputCanvas!: IInputCanvas;
    private gridDrawingCanvas!: IDrawingCanvas<IGridCanvas>;
    private stitchDrawingCanvas!: IDrawingCanvas<IStitchCanvas>;
    private cueDrawingCanvas!: IDrawingCanvas<ICueCanvas>;

    public build(): ICrosslyCanvas {
        const crosslyCanvas = new CrosslyCanvas(this.inputCanvas, this.gridDrawingCanvas, this.stitchDrawingCanvas, this.cueDrawingCanvas);
        return crosslyCanvas;
    }

    public withInputCanvas(htmlSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const inputCanvas = new InputCanvas(htmlSvgElement);
        const inputCanvasThrottler = new InputCanvasThrottler(inputCanvas);
        this.inputCanvas = inputCanvasThrottler;
        return this;
    }

    public withGridCanvas(htmlCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        const rasterDrawing = new RasterDrawing(htmlCanvasElement);
        this.gridDrawingCanvas = new GirdDrawingCanvas(rasterDrawing);
        return this;
    }

    public withStitchCanvas(htmlCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        const rasterDrawing = new RasterDrawing(htmlCanvasElement);
        this.stitchDrawingCanvas = new StitchDrawingCanvas(rasterDrawing);
        return this;
    }

    public withCueCanvas(htmlSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const vectorDrawing = new VectorDrawing(htmlSvgElement);
        this.cueDrawingCanvas = new CueDrawingCanvas(vectorDrawing);
        return this;
    }
}