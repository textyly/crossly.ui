import { CueCanvas } from "./drawing/cue/cue.js";
import { DotCanvas } from "./drawing/dot/dot.js";
import { FrontLineCanvas } from "./drawing/line/front.js";
import { RasterCanvas } from "./drawing/raster/raster.js";
import { SvgCanvas } from "./drawing/svg/svg.js";
import { InputCanvas } from "./input/input.js";
import { InputCanvasThrottler } from "./input/throttler.js";
import { TransparentCanvas } from "./input/transparent.js";
import { IVirtualCanvas } from "./virtual/types.js";
import { VirtualCanvas } from "./virtual/virtual.js";

export class CrosslyCanvasBuilder {
    private inputCanvas?: HTMLElement;
    private dotCanvas?: HTMLCanvasElement;
    private lineCanvas?: HTMLCanvasElement;
    private cueCanvas?: HTMLElement;

    public build(): IVirtualCanvas {
        const transparentCanvas = new TransparentCanvas(this.inputCanvas!);
        // ???

        const inputCanvas = new InputCanvas(transparentCanvas);
        // ???

        const inputCanvasThrottler = new InputCanvasThrottler(inputCanvas);
        // ???

        const dotsConfig = { x: 30, y: 20, radius: { value: 2, step: 0.2 }, spacing: { value: 20, step: 2 } };
        const virtualCanvas = new VirtualCanvas(dotsConfig, inputCanvasThrottler);
        // virtualCanvas.subscribe(inputCanvasThrottler);

        const dotRasterCanvas = new RasterCanvas(this.dotCanvas!);
        const dotCanvas = new DotCanvas(dotRasterCanvas, virtualCanvas);
        // dotCanvas.subscribe(virtualCanvas);

        const lineRasterCanvas = new RasterCanvas(this.lineCanvas!);
        const lineCanvas = new FrontLineCanvas(lineRasterCanvas, virtualCanvas);
        // lineCanvas.subscribe(virtualCanvas);

        const cueSvgCanvas = new SvgCanvas(this.cueCanvas!);
        const cueCanvas = new CueCanvas(cueSvgCanvas, virtualCanvas);
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