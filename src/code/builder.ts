import { InputCanvasThrottler } from "./canvas/input/throttler.js";
import { InputCanvas } from "./canvas/input/input.js";
import { IInputCanvas } from "./canvas/input/types.js";
import { VirtualCanvas } from "./canvas/virtual/virtual.js";
import { DynamicCanvas } from "./canvas/drawing/dynamic/dynamic.js";
import { ICueVirtualCanvas, IDotVirtualCanvas, ILineVirtualCanvas, IVirtualCanvas } from "./canvas/virtual/types.js";
import { TransparentCanvas } from "./canvas/input/transparent.js";
import { RasterCanvas } from "./canvas/drawing/raster/raster.js";
import { FrontHybridCanvas } from "./canvas/drawing/hybrid/front.js";
import { SvgCanvas } from "./canvas/drawing/svg/svg.js";
import { StaticCanvas } from "./canvas/drawing/static/static.js";

export class CanvasBuilder {
    public build(): IVirtualCanvas {
        // real canvas
        const userInputCanvas = this.buildInputCanvas();

        // throttler
        const userInputCanvasThrottler = this.buildInputCanvasThrottler(userInputCanvas);

        // virtual canvas
        const virtualCanvas = this.buildVirtualCanvas(userInputCanvasThrottler);

        // real canvas
        this.buildStaticCanvas(virtualCanvas);

        // real canvas
        this.buildHybridCanvas(virtualCanvas);

        // real canvas
        this.buildDynamicCanvas(virtualCanvas);

        return virtualCanvas;
    }

    private buildInputCanvas(): IInputCanvas {
        const svgCanvas = document.getElementById("input") as HTMLElement;
        const wrapper = new TransparentCanvas(svgCanvas);
        wrapper.initialize();

        const canvas = new InputCanvas(wrapper);
        canvas.initialize();

        return canvas;
    }

    private buildInputCanvasThrottler(userInputCanvasCapturer: IInputCanvas): IInputCanvas {
        const headlessCanvas = new InputCanvasThrottler(userInputCanvasCapturer);
        headlessCanvas.initialize();
        return headlessCanvas;
    }

    private buildVirtualCanvas(userInputCanvasThrottler: IInputCanvas): IVirtualCanvas {
        const dotsConfig = { x: 30, y: 20, radius: { value: 2, step: 0.2 }, spacing: { value: 20, step: 2 } };
        const virtualCanvas = new VirtualCanvas(dotsConfig, userInputCanvasThrottler);
        virtualCanvas.initialize();
        return virtualCanvas;
    }

    private buildStaticCanvas(dotVirtualCanvas: IDotVirtualCanvas): void {
        const htmlCanvas = document.getElementById("static") as HTMLCanvasElement;
        const rasterStaticCanvas = new RasterCanvas(htmlCanvas);
        rasterStaticCanvas.initialize();

        const staticCanvas = new StaticCanvas(rasterStaticCanvas, dotVirtualCanvas);
        staticCanvas.initialize();
    }

    private buildHybridCanvas(lineVirtualCanvas: ILineVirtualCanvas): void {
        const hybridCanvas = document.getElementById("hybrid") as HTMLCanvasElement;
        const hybridStaticCanvas = new RasterCanvas(hybridCanvas);
        hybridStaticCanvas.initialize();

        const frontHybridCanvas = new FrontHybridCanvas(hybridStaticCanvas, lineVirtualCanvas);
        frontHybridCanvas.initialize();
    }

    private buildDynamicCanvas(cueVirtualCanvas: ICueVirtualCanvas): void {
        const svgHtmlCanvas = document.getElementById("dynamic") as HTMLElement;
        const svgCanvas = new SvgCanvas(svgHtmlCanvas);
        svgCanvas.initialize();

        const dynamicCanvas = new DynamicCanvas(svgCanvas, cueVirtualCanvas);
        dynamicCanvas.initialize();
    }
}