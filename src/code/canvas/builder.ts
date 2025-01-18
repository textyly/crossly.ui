import { CueCanvas } from "./drawing/cue.js";
import { DotCanvas } from "./drawing/dot.js";
import { LineCanvas } from "./drawing/line.js";
import { RasterDrawing } from "./drawing/raster.js";
import { VectorDrawing } from "./drawing/vector.js";
import { InputCanvas } from "./input/input.js";
import { InputCanvasThrottler } from "./input/throttler.js";
import { IVirtualCanvas } from "./virtual/types.js";
import { VirtualCanvas } from "./virtual/virtual.js";

export class CrosslyCanvasBuilder {
    private inputCanvas?: HTMLElement;
    private dotCanvas?: HTMLCanvasElement;
    private lineCanvas?: HTMLCanvasElement;
    private cueCanvas?: HTMLElement;

    public build(): IVirtualCanvas {
        const inputCanvas = new InputCanvas(this.inputCanvas!);
        // ???

        const inputCanvasThrottler = new InputCanvasThrottler(inputCanvas);
        // ???

        const dotsConfig = { x: 30, y: 20, radius: { value: 2, step: 0.2 }, spacing: { value: 20, step: 2 } };
        const virtualCanvas = new VirtualCanvas(dotsConfig, inputCanvasThrottler);
        // virtualCanvas.subscribe(inputCanvasThrottler);

        const dotRasterDrawing = new RasterDrawing(this.dotCanvas!);
        const dotCanvas = new DotCanvas(dotRasterDrawing, virtualCanvas);
        // dotCanvas.subscribe(virtualCanvas);

        const lineRasterDrawing = new RasterDrawing(this.lineCanvas!);
        const lineCanvas = new LineCanvas(lineRasterDrawing, virtualCanvas);
        // lineCanvas.subscribe(virtualCanvas);

        const cueVectorDrawing = new VectorDrawing(this.cueCanvas!);
        const cueCanvas = new CueCanvas(cueVectorDrawing, virtualCanvas);
        // cueCanvas.subscribe(virtualCanvas);

        return virtualCanvas;
    }

    public withInputCanvas(inputCanvas: HTMLElement): CrosslyCanvasBuilder {
        this.inputCanvas = inputCanvas;
        return this;
    }

    public withDotCanvas(dotCanvas: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.dotCanvas = dotCanvas;
        return this;
    }

    public withLineCanvas(lineCanvas: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.lineCanvas = lineCanvas;
        return this;
    }

    public withCueCanvas(cueCanvas: HTMLElement): CrosslyCanvasBuilder {
        this.cueCanvas = cueCanvas;
        return this;
    }
}