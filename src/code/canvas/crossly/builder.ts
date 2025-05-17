import assert from "../../asserts/assert.js";
import { InputCanvas } from "../input/input.js";
import { IInputCanvas } from "../input/types.js";
import { ICrosslyCanvasFacade } from "../types.js";
import { CrosslyCanvasFacade } from "./facade.js";
import { CrosslyCanvasConfig } from "../../config/types.js";
import { VectorDrawingCanvas } from "../drawing/vector/vector.js";
import { FabricRasterDrawingCanvas } from "../drawing/raster/fabric.js";
import { StitchRasterDrawingCanvas } from "../drawing/raster/stitch.js";
import { IFabricRasterDrawingCanvas, IStitchRasterDrawingCanvas, IVectorDrawingCanvas } from "../drawing/types.js";

export class CrosslyCanvasBuilder {
    private name: string;
    private config!: CrosslyCanvasConfig;
    private inputCanvas!: IInputCanvas;
    private fabricRasterDrawing!: IFabricRasterDrawingCanvas;
    private stitchRasterDrawing!: IStitchRasterDrawingCanvas;
    private cueVectorDrawing!: IVectorDrawingCanvas;

    constructor() {
        this.name = "Untitled1";
    }

    public build(): ICrosslyCanvasFacade {
        assert.defined(this.config, "CrosslyCanvasConfig");
        assert.defined(this.inputCanvas, "inputCanvas");
        assert.defined(this.fabricRasterDrawing, "fabricRasterDrawing");
        assert.defined(this.stitchRasterDrawing, "stitchRasterDrawing");
        assert.defined(this.cueVectorDrawing, "cueVectorDrawing");

        return this.buildCore();
    }

    public withConfig(config: CrosslyCanvasConfig): CrosslyCanvasBuilder {
        this.config = config;
        return this;
    }

    public withInputCanvas(inputHtmlElement: HTMLElement): CrosslyCanvasBuilder {
        assert.defined(this.config, "CrosslyCanvasConfig");

        this.inputCanvas = new InputCanvas(this.config.input, inputHtmlElement);
        return this;
    }

    public withFabricCanvas(fabricHtmlElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.fabricRasterDrawing = new FabricRasterDrawingCanvas(fabricHtmlElement);
        return this;
    }

    public withStitchCanvas(stitchHtmlElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.stitchRasterDrawing = new StitchRasterDrawingCanvas(stitchHtmlElement);
        return this;
    }

    public withCueCanvas(cueHtmlElement: HTMLElement): CrosslyCanvasBuilder {
        this.cueVectorDrawing = new VectorDrawingCanvas(cueHtmlElement);
        return this;
    }

    private buildCore(): ICrosslyCanvasFacade {
        const crosslyCanvasFacade = new CrosslyCanvasFacade(
            this.name,
            this.config,
            this.inputCanvas,
            this.fabricRasterDrawing,
            this.stitchRasterDrawing,
            this.cueVectorDrawing);

        return crosslyCanvasFacade;
    }
}