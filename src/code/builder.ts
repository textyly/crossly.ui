import { InputCanvasThrottler } from "./canvas/input/throttler.js";
import { InputCanvas } from "./canvas/input/input.js";
import { IInputCanvas } from "./canvas/input/types.js";
import { VirtualCanvas } from "./canvas/virtual/virtual.js";
import { CueCanvas } from "./canvas/drawing/cue/cue.js";
import { ICueVirtualCanvas, IDotVirtualCanvas, ILineVirtualCanvas, IVirtualCanvas } from "./canvas/virtual/types.js";
import { TransparentCanvas } from "./canvas/input/transparent.js";
import { RasterCanvas } from "./canvas/drawing/raster/raster.js";
import { FrontLineCanvas } from "./canvas/drawing/line/front.js";
import { SvgCanvas } from "./canvas/drawing/svg/svg.js";
import { DotCanvas } from "./canvas/drawing/dot/dot.js";

export class CanvasBuilder {
    public build(): IVirtualCanvas {
        // real canvas
        const inputCanvas = this.buildInputCanvas();

        // throttler
        const inputCanvasThrottler = this.buildInputCanvasThrottler(inputCanvas);

        // virtual canvas
        const virtualCanvas = this.buildVirtualCanvas(inputCanvasThrottler);

        // real canvas
        this.buildDotCanvas(virtualCanvas);

        // real canvas
        this.buildFrontLineCanvas(virtualCanvas);

        // real canvas
        this.buildCueCanvas(virtualCanvas);

        return virtualCanvas;
    }

    private buildInputCanvas(): IInputCanvas {
        const htmSvgCanvas = document.getElementById("input") as HTMLElement;
        const transparentCanvas = new TransparentCanvas(htmSvgCanvas);
        const inputCanvas = new InputCanvas(transparentCanvas);
        return inputCanvas;
    }

    private buildInputCanvasThrottler(inputCanvas: IInputCanvas): IInputCanvas {
        const inputCanvasThrottler = new InputCanvasThrottler(inputCanvas);
        return inputCanvasThrottler;
    }

    private buildVirtualCanvas(inputCanvas: IInputCanvas): IVirtualCanvas {
        const dotsConfig = { x: 30, y: 20, radius: { value: 2, step: 0.2 }, spacing: { value: 20, step: 2 } };
        const virtualCanvas = new VirtualCanvas(dotsConfig, inputCanvas);
        return virtualCanvas;
    }

    private buildDotCanvas(dotVirtualCanvas: IDotVirtualCanvas): void {
        const htmlCanvasElement = document.getElementById("dot") as HTMLCanvasElement;
        const rasterCanvas = new RasterCanvas(htmlCanvasElement);
        const dotCanvas = new DotCanvas(rasterCanvas, dotVirtualCanvas);
    }

    private buildFrontLineCanvas(lineVirtualCanvas: ILineVirtualCanvas): void {
        const htmlCanvasElement = document.getElementById("line") as HTMLCanvasElement;
        const rasterCanvas = new RasterCanvas(htmlCanvasElement);
        const lineCanvas = new FrontLineCanvas(rasterCanvas, lineVirtualCanvas);
    }

    private buildCueCanvas(cueVirtualCanvas: ICueVirtualCanvas): void {
        const htmSvgCanvas = document.getElementById("cue") as HTMLElement;
        const svgCanvas = new SvgCanvas(htmSvgCanvas);
        const dynamicCanvas = new CueCanvas(svgCanvas, cueVirtualCanvas);
    }
}