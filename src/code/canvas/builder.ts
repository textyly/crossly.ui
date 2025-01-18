import { CrosslyCanvas } from "./crossly.js";
import { CueCanvas } from "./drawing/cue.js";
import { DotCanvas } from "./drawing/dot.js";
import { LineCanvas } from "./drawing/line.js";
import { RasterDrawing } from "./drawing/raster.js";
import { VectorDrawing } from "./drawing/vector.js";
import { InputCanvas } from "./input/input.js";
import { InputCanvasThrottler } from "./input/throttler.js";
import { IInputCanvas } from "./input/types.js";
import { ICrosslyCanvas } from "./types.js";

export class CrosslyCanvasBuilder {
    private inputCanvas!: IInputCanvas;
    private dotCanvas!: DotCanvas;
    private lineCanvas!: LineCanvas;
    private cueCanvas!: CueCanvas;

    public build(): ICrosslyCanvas {
        const crosslyCanvas = new CrosslyCanvas();
        crosslyCanvas.initialize(this.inputCanvas, this.dotCanvas, this.lineCanvas, this.cueCanvas);
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
        this.dotCanvas = new DotCanvas(rasterDrawing);
        return this;
    }

    public withLineCanvas(htmlCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        const rasterDrawing = new RasterDrawing(htmlCanvasElement);
        this.lineCanvas = new LineCanvas(rasterDrawing);
        return this;
    }

    public withCueCanvas(htmlSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const vectorDrawing = new VectorDrawing(htmlSvgElement);
        this.cueCanvas = new CueCanvas(vectorDrawing);
        return this;
    }
}