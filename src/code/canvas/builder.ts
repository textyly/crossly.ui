import { ICrosslyCanvas } from "./types.js";
import { CrosslyCanvas } from "./crossly.js";
import { InputCanvas } from "./input/input.js";
import { IInputCanvas } from "./input/types.js";
import { CueDrawingCanvas } from "./drawing/cue.js";
import { DotDrawingCanvas } from "./drawing/dot.js";
import { RasterDrawing } from "./drawing/raster.js";
import { IDrawingCanvas } from "./drawing/types.js";
import { VectorDrawing } from "./drawing/vector.js";
import { LineDrawingCanvas } from "./drawing/line.js";
import { InputCanvasThrottler } from "./input/throttler.js";
import { ICueVirtualCanvas, IDotVirtualCanvas, ILineVirtualCanvas } from "./virtual/types.js";

export class CrosslyCanvasBuilder {
    private inputCanvas!: IInputCanvas;
    private dotDrawingCanvas!: IDrawingCanvas<IDotVirtualCanvas>;
    private lineDrawingCanvas!: IDrawingCanvas<ILineVirtualCanvas>;
    private cueDrawingCanvas!: IDrawingCanvas<ICueVirtualCanvas>;

    public build(): ICrosslyCanvas {
        const crosslyCanvas = new CrosslyCanvas(this.inputCanvas, this.dotDrawingCanvas, this.lineDrawingCanvas, this.cueDrawingCanvas);
        return crosslyCanvas;
    }

    public withInputCanvas(htmlSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const inputCanvas = new InputCanvas(htmlSvgElement);
        const inputCanvasThrottler = new InputCanvasThrottler(inputCanvas);
        this.inputCanvas = inputCanvasThrottler;
        return this;
    }

    public withDotCanvas(htmlCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        const rasterDrawing = new RasterDrawing(htmlCanvasElement);
        this.dotDrawingCanvas = new DotDrawingCanvas(rasterDrawing);
        return this;
    }

    public withLineCanvas(htmlCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        const rasterDrawing = new RasterDrawing(htmlCanvasElement);
        this.lineDrawingCanvas = new LineDrawingCanvas(rasterDrawing);
        return this;
    }

    public withCueCanvas(htmlSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const vectorDrawing = new VectorDrawing(htmlSvgElement);
        this.cueDrawingCanvas = new CueDrawingCanvas(vectorDrawing);
        return this;
    }
}