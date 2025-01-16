import { InputCanvasThrottler } from "./canvas/input/throttler.js";
import { InputCanvas } from "./canvas/input/input.js";
import { IInputCanvas } from "./canvas/input/types.js";
import { VirtualCanvas } from "./canvas/virtual/virtual.js";
import { DynamicCanvas } from "./canvas/drawing/dynamic/dynamic.js";
import { IVirtualCanvas } from "./canvas/virtual/types.js";
import { TransparentCanvas } from "./canvas/input/transparent.js";
import { RasterCanvas } from "./canvas/drawing/raster/raster.js";
import { FrontHybridCanvas } from "./canvas/drawing/hybrid/front.js";
import { SvgCanvas } from "./canvas/drawing/svg/svg.js";
import { StaticCanvas } from "./canvas/drawing/static/static.js";

export class CanvasBuilder {
    public build(): IVirtualCanvas {
        const userInputCanvas = this.buildUserInputCanvas();
        const userInputCanvasThrottler = this.buildUserInputCanvasThrottler(userInputCanvas);
        const virtualCanvas = this.buildVirtualCanvas(userInputCanvasThrottler);

        this.buildStaticCanvas(virtualCanvas);
        this.buildDynamicCanvas(virtualCanvas);

        return virtualCanvas;
    }

    private buildUserInputCanvas(): IInputCanvas {
        const svgCanvas = document.getElementById("plot") as HTMLElement;
        const wrapper = new TransparentCanvas(svgCanvas);
        wrapper.initialize();

        const canvas = new InputCanvas(wrapper);
        canvas.initialize();

        return canvas;
    }

    private buildUserInputCanvasThrottler(userInputCanvasCapturer: IInputCanvas): IInputCanvas {
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

    private buildStaticCanvas(virtualCanvas: IVirtualCanvas): void {
        const htmlCanvas = document.getElementById("canvas") as HTMLCanvasElement;
        const rasterCanvas = new RasterCanvas(htmlCanvas);
        rasterCanvas.initialize();

        const staticCanvas = new StaticCanvas(rasterCanvas, virtualCanvas);
        staticCanvas.initialize();

        //TODO: new line related raster canvas
        const frontHybridCanvas = new FrontHybridCanvas(rasterCanvas, virtualCanvas);
        frontHybridCanvas.initialize();
    }

    private buildDynamicCanvas(virtualCanvas: IVirtualCanvas): void {
        const svgHtmlCanvas = document.getElementById("svg") as HTMLElement;
        const svgCanvas = new SvgCanvas(svgHtmlCanvas);
        svgCanvas.initialize();

        const dynamicCanvas = new DynamicCanvas(svgCanvas, virtualCanvas);
        dynamicCanvas.initialize();
    }
}