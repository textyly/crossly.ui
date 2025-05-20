import assert from "../../asserts/assert.js";
import { InputCanvas } from "../input/input.js";
import { ICrosslyCanvasFacade } from "../types.js";
import { CrosslyCanvasFacade } from "./facade.js";
import { CrosslyCanvasConfig } from "../../config/types.js";
import { VectorDrawingCanvas } from "../drawing/vector/vector.js";
import { FabricRasterDrawingCanvas } from "../drawing/raster/fabric.js";
import { StitchRasterDrawingCanvas } from "../drawing/raster/stitch.js";

export class CrosslyCanvasBuilder {
    private name: string;
    private config!: CrosslyCanvasConfig;
    private inputHtmlElement!: HTMLElement;
    private fabricHtmlElement!: HTMLCanvasElement;
    private stitchHtmlElement!: HTMLCanvasElement;
    private cueHtmlElement!: HTMLElement;
    private backFabricHtmlElement!: HTMLCanvasElement;
    private backStitchHtmlElement!: HTMLCanvasElement;

    constructor() {
        this.name = "Untitled1"; // TODO: remove this hardcoded name
    }

    public build(): ICrosslyCanvasFacade {
        assert.defined(this.config, "CrosslyCanvasConfig");
        assert.defined(this.inputHtmlElement, "inputHtmlElement");
        assert.defined(this.fabricHtmlElement, "fabricHtmlElement");
        assert.defined(this.stitchHtmlElement, "stitchHtmlElement");
        assert.defined(this.cueHtmlElement, "cueHtmlElement");
        assert.defined(this.backFabricHtmlElement, "backFabricHtmlElement");
        assert.defined(this.backStitchHtmlElement, "backStitchHtmlElement");

        return this.buildCore();
    }

    public withConfig(config: CrosslyCanvasConfig): CrosslyCanvasBuilder {
        this.config = config;
        return this;
    }

    public withInputCanvas(inputHtmlElement: HTMLElement): CrosslyCanvasBuilder {
        assert.defined(this.config, "CrosslyCanvasConfig");
        this.inputHtmlElement = inputHtmlElement;
        return this;
    }

    public withFabricCanvas(fabricHtmlElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.fabricHtmlElement = fabricHtmlElement;
        return this;
    }

    public withStitchCanvas(stitchHtmlElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.stitchHtmlElement = stitchHtmlElement;
        return this;
    }

    public withCueCanvas(cueHtmlElement: HTMLElement): CrosslyCanvasBuilder {
        this.cueHtmlElement = cueHtmlElement
        return this;
    }

    public withBackFabricCanvas(backFabricHtmlElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.backFabricHtmlElement = backFabricHtmlElement;
        return this;
    }

    public withBackStitchCanvas(backStitchHtmlElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.backStitchHtmlElement = backStitchHtmlElement;
        return this;
    }

    private buildCore(): ICrosslyCanvasFacade {

        const inputCanvas = new InputCanvas(this.config.input, this.inputHtmlElement);
        const fabricRasterDrawing = new FabricRasterDrawingCanvas(this.fabricHtmlElement, this.backFabricHtmlElement);
        const stitchRasterDrawing = new StitchRasterDrawingCanvas(this.stitchHtmlElement, this.backStitchHtmlElement);
        const cueVectorDrawing = new VectorDrawingCanvas(this.cueHtmlElement);

        const crosslyCanvasFacade = new CrosslyCanvasFacade(
            this.name,
            this.config,
            inputCanvas,
            fabricRasterDrawing,
            stitchRasterDrawing,
            cueVectorDrawing);

        return crosslyCanvasFacade;
    }
}