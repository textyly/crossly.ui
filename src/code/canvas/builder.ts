import { CrosslyCanvas } from "./crossly.js";
import { CueCanvas } from "./drawing/cue.js";
import { DotCanvas } from "./drawing/dot.js";
import { LineCanvas } from "./drawing/line.js";
import { RasterDrawing } from "./drawing/raster.js";
import { VectorDrawing } from "./drawing/vector.js";
import { InputCanvas } from "./input/input.js";
import { InputCanvasThrottler } from "./input/throttler.js";
import { IInputCanvas } from "./input/types.js";
import { IVirtualCanvas } from "./virtual/types.js";
import { VirtualCanvas } from "./virtual/virtual.js";

export class CrosslyCanvasBuilder {
    private inputCanvas!: IInputCanvas;
    private virtualCanvas!: IVirtualCanvas;
    private dotCanvas!: DotCanvas;
    private lineCanvas!: LineCanvas;
    private cueCanvas!: CueCanvas;

    public build(): CrosslyCanvas {
        const crosslyCanvas = new CrosslyCanvas(
            this.inputCanvas,
            this.virtualCanvas,
            this.dotCanvas,
            this.lineCanvas,
            this.cueCanvas
        );

        return crosslyCanvas;
    }

    public withInputCanvas(htmlSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const inputCanvas = new InputCanvas(htmlSvgElement);
        const inputCanvasThrottler = new InputCanvasThrottler(inputCanvas);
        this.inputCanvas = inputCanvasThrottler;

        const dotsConfig = { x: 30, y: 20, radius: { value: 2, step: 0.2 }, spacing: { value: 20, step: 2 } };
        this.virtualCanvas = new VirtualCanvas(dotsConfig, inputCanvasThrottler);

        return this;
    }

    public withDotCanvas(htmlCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        const rasterDrawing = new RasterDrawing(htmlCanvasElement);
        this.dotCanvas = new DotCanvas(rasterDrawing, this.virtualCanvas);
        return this;
    }

    public withLineCanvas(htmlCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        const rasterDrawing = new RasterDrawing(htmlCanvasElement);
        this.lineCanvas = new LineCanvas(rasterDrawing, this.virtualCanvas);
        return this;
    }

    public withCueCanvas(htmlSvgElement: HTMLElement): CrosslyCanvasBuilder {
        const vectorDrawing = new VectorDrawing(htmlSvgElement);
        this.cueCanvas = new CueCanvas(vectorDrawing, this.virtualCanvas);
        return this;
    }
}