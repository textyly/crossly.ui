import assert from "./asserts/assert.js";
import { CrosslyCanvasConfig } from "./config/types.js";
import { ICrosslyCanvasFacade } from "./canvas/types.js";
import { CrosslyCanvasBuilder } from "./canvas/builder.js";

export class CanvasBuilder {
    private readonly crosslyCanvasBuilder: CrosslyCanvasBuilder;
    private config!: CrosslyCanvasConfig;

    constructor() {
        this.crosslyCanvasBuilder = new CrosslyCanvasBuilder();
    }

    public build(): ICrosslyCanvasFacade {
        assert.defined(this.config, "config");
        return this.buildCore(this.config);
    }

    public withConfig(config: CrosslyCanvasConfig): CanvasBuilder {
        this.config = config;
        return this;
    }

    private buildCore(config: CrosslyCanvasConfig): ICrosslyCanvasFacade {
        this.crosslyCanvasBuilder.withConfig(config);

        const inputHtmlElement = this.buildInputHtmlElement();
        this.crosslyCanvasBuilder.withInputCanvas(inputHtmlElement);

        const fabricHtmlElement = this.buildFabricHtmlElement();
        this.crosslyCanvasBuilder.withFabricCanvas(fabricHtmlElement);

        const stitchHtmlElement = this.buildStitchHtmlElement();
        this.crosslyCanvasBuilder.withStitchCanvas(stitchHtmlElement);

        const cueHtmlElement = this.buildCueHtmlElement();
        this.crosslyCanvasBuilder.withCueCanvas(cueHtmlElement);

        const crosslyCanvas = this.crosslyCanvasBuilder.build();
        return crosslyCanvas;
    }

    private buildInputHtmlElement(): HTMLElement {
        const inputHtmlElement = document.getElementById("input") as HTMLElement;
        assert.defined(inputHtmlElement, "inputHtmlElement");
        return inputHtmlElement;
    }

    private buildFabricHtmlElement(): HTMLCanvasElement {
        const fabricHtmlElement = document.getElementById("fabric") as HTMLCanvasElement;
        assert.defined(fabricHtmlElement, "fabricHtmlElement");
        return fabricHtmlElement;
    }

    private buildStitchHtmlElement(): HTMLCanvasElement {
        const stitchHtmlElement = document.getElementById("stitch") as HTMLCanvasElement;
        assert.defined(stitchHtmlElement, "stitchHtmlElement");
        return stitchHtmlElement;
    }

    private buildCueHtmlElement(): HTMLElement {
        const cueHtmlElement = document.getElementById("cue") as HTMLElement;
        assert.defined(cueHtmlElement, "cueHtmlElement");
        return cueHtmlElement;
    }
}