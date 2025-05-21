import assert from "../../asserts/assert.js";
import { InputCanvas } from "../input/input.js";
import { CrosslyCanvasFacade } from "./facade.js";
import { CrosslyCanvasConfig } from "../../config/types.js";
import { CanvasSide, ICrosslyCanvasFacade } from "../types.js";
import { VectorDrawingCanvas } from "../drawing/vector/vector.js";
import { FabricRasterDrawingCanvas } from "../drawing/raster/fabric.js";
import { StitchRasterDrawingCanvas } from "../drawing/raster/stitch.js";

export class CrosslyCanvasBuilder {
    private name: string;
    private config!: CrosslyCanvasConfig;

    private inputHtmlElement!: HTMLElement;
    private frontFabricHtmlElement!: HTMLCanvasElement;
    private frontStitchHtmlElement!: HTMLCanvasElement;
    private frontCueHtmlElement!: HTMLElement;

    private backFabricHtmlElement!: HTMLCanvasElement;
    private backStitchHtmlElement!: HTMLCanvasElement;
    private backCueHtmlElement!: HTMLElement;

    constructor() {
        this.name = "Untitled1"; // TODO: remove this hardcoded name
    }

    public build(): ICrosslyCanvasFacade {
        assert.defined(this.config, "CrosslyCanvasConfig");

        assert.defined(this.inputHtmlElement, "inputHtmlElement");
        assert.defined(this.frontFabricHtmlElement, "fabricHtmlElement");
        assert.defined(this.frontStitchHtmlElement, "stitchHtmlElement");
        assert.defined(this.frontCueHtmlElement, "cueHtmlElement");

        assert.defined(this.backFabricHtmlElement, "backFabricHtmlElement");
        assert.defined(this.backStitchHtmlElement, "backStitchHtmlElement");
        assert.defined(this.backCueHtmlElement, "backCueHtmlElement");

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
        this.frontFabricHtmlElement = fabricHtmlElement;
        return this;
    }

    public withStitchCanvas(stitchHtmlElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.frontStitchHtmlElement = stitchHtmlElement;
        return this;
    }

    public withCueCanvas(cueHtmlElement: HTMLElement): CrosslyCanvasBuilder {
        this.frontCueHtmlElement = cueHtmlElement
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

    public withBackCueCanvas(backCueHtmlElement: HTMLElement): CrosslyCanvasBuilder {
        this.backCueHtmlElement = backCueHtmlElement
        return this;
    }

    private buildCore(): ICrosslyCanvasFacade {

        const inputCanvas = new InputCanvas(this.config.input, this.inputHtmlElement);

        const frontFabricRasterDrawing = new FabricRasterDrawingCanvas(this.frontFabricHtmlElement);
        const backFabricRasterDrawing = new FabricRasterDrawingCanvas(this.backFabricHtmlElement);

        const frontStitchRasterDrawing = new StitchRasterDrawingCanvas(this.frontStitchHtmlElement, CanvasSide.Front);
        const backStitchRasterDrawing = new StitchRasterDrawingCanvas(this.backStitchHtmlElement, CanvasSide.Back);

        const frontCueVectorDrawing = new VectorDrawingCanvas(this.frontCueHtmlElement);
        const backCueVectorDrawing = new VectorDrawingCanvas(this.backCueHtmlElement);

        const crosslyCanvasFacade = new CrosslyCanvasFacade(
            this.name,
            this.config,
            inputCanvas,
            frontFabricRasterDrawing,
            backFabricRasterDrawing,
            frontStitchRasterDrawing,
            backStitchRasterDrawing,
            frontCueVectorDrawing,
            backCueVectorDrawing);

        return crosslyCanvasFacade;
    }
}