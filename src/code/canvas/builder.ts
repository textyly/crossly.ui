import { InputCanvas } from "./input/input.js";
import { IInputCanvas } from "./input/types.js";
import { ICrosslyCanvasFacade } from "./types.js";
import { CrosslyCanvasFacade } from "./facade.js";
import { CrosslyCanvasConfig } from "../config/types.js";
import { VectorDrawingCanvas } from "./drawing/vector/vector.js";
import { FabricRasterDrawingCanvas } from "./drawing/raster/fabric.js";
import { StitchRasterDrawingCanvas } from "./drawing/raster/stitch.js";
import { IRasterDrawingCanvas, IVectorDrawingCanvas } from "./drawing/types.js";

export class CrosslyCanvasBuilder {
    private config!: CrosslyCanvasConfig;
    private inputCanvas!: IInputCanvas;
    private fabricRasterDrawing!: IRasterDrawingCanvas;
    private stitchRasterDrawing!: IRasterDrawingCanvas;
    private cueVectorDrawing!: IVectorDrawingCanvas;

    public build(): ICrosslyCanvasFacade {
        const crosslyCanvasFacade = new CrosslyCanvasFacade(
            this.config,
            this.inputCanvas,
            this.fabricRasterDrawing,
            this.stitchRasterDrawing,
            this.cueVectorDrawing);

        return crosslyCanvasFacade;
    }

    public withConfig(config: CrosslyCanvasConfig): CrosslyCanvasBuilder {
        this.config = config;
        return this;
    }

    public withInputCanvas(inputElement: HTMLElement): CrosslyCanvasBuilder {
        this.inputCanvas = new InputCanvas(this.config.input, inputElement);
        return this;
    }

    public withFabricCanvas(fabricCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.fabricRasterDrawing = new FabricRasterDrawingCanvas(fabricCanvasElement);
        return this;
    }

    public withStitchCanvas(stitchCanvasElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.stitchRasterDrawing = new StitchRasterDrawingCanvas(stitchCanvasElement);
        return this;
    }

    public withCueCanvas(cueSvgElement: HTMLElement): CrosslyCanvasBuilder {
        this.cueVectorDrawing = new VectorDrawingCanvas(cueSvgElement);
        return this;
    }
}