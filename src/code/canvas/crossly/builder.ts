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

    private frontInputHtmlElement!: HTMLElement;
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

        assert.defined(this.frontInputHtmlElement, "frontInputHtmlElement");
        assert.defined(this.frontFabricHtmlElement, "frontFabricHtmlElement");
        assert.defined(this.frontStitchHtmlElement, "frontStitchHtmlElement");
        assert.defined(this.frontCueHtmlElement, "frontCueHtmlElement");

        assert.defined(this.backFabricHtmlElement, "backFabricHtmlElement");
        assert.defined(this.backStitchHtmlElement, "backStitchHtmlElement");
        assert.defined(this.backCueHtmlElement, "backCueHtmlElement");

        return this.buildCore();
    }

    public withConfig(config: CrosslyCanvasConfig): CrosslyCanvasBuilder {
        this.config = config;
        return this;
    }

    public withFrontInputCanvas(frontInputHtmlElement: HTMLElement): CrosslyCanvasBuilder {
        assert.defined(this.config, "CrosslyCanvasConfig");
        this.frontInputHtmlElement = frontInputHtmlElement;
        return this;
    }

    public withFrontFabricCanvas(frontFabricHtmlElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.frontFabricHtmlElement = frontFabricHtmlElement;
        return this;
    }

    public withFrontStitchCanvas(frontStitchHtmlElement: HTMLCanvasElement): CrosslyCanvasBuilder {
        this.frontStitchHtmlElement = frontStitchHtmlElement;
        return this;
    }

    public withFrontCueCanvas(frontCueHtmlElement: HTMLElement): CrosslyCanvasBuilder {
        this.frontCueHtmlElement = frontCueHtmlElement
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

        const inputCanvas = new InputCanvas(this.config.input, this.frontInputHtmlElement);

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