import assert from "./asserts/assert.js";
import { CrosslyCanvasConfig } from "./config/types.js";
import { ICrosslyCanvasFacade } from "./canvas/types.js";
import { CrosslyCanvasBuilder } from "./canvas/crossly/builder.js";

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

        const frontFabricHtmlElement = this.buildFrontFabricHtmlElement();
        this.crosslyCanvasBuilder.withFrontFabricCanvas(frontFabricHtmlElement);

        const frontStitchHtmlElement = this.buildFrontStitchHtmlElement();
        this.crosslyCanvasBuilder.withFrontStitchCanvas(frontStitchHtmlElement);

        const frontCueHtmlElement = this.buildFrontCueHtmlElement();
        this.crosslyCanvasBuilder.withFrontCueCanvas(frontCueHtmlElement);

        const backFabricHtmlElement = this.buildBackFabricHtmlElement();
        this.crosslyCanvasBuilder.withBackFabricCanvas(backFabricHtmlElement);

        const backStitchHtmlElement = this.buildBackStitchHtmlElement();
        this.crosslyCanvasBuilder.withBackStitchCanvas(backStitchHtmlElement);

        const backCueHtmlElement = this.buildBackCueHtmlElement();
        this.crosslyCanvasBuilder.withBackCueCanvas(backCueHtmlElement);

        const crosslyCanvas = this.crosslyCanvasBuilder.build();
        return crosslyCanvas;
    }

    private buildInputHtmlElement(): HTMLElement {
        const inputHtmlElement = document.getElementById("input") as HTMLElement;
        assert.defined(inputHtmlElement, "inputHtmlElement");
        return inputHtmlElement;
    }

    private buildFrontFabricHtmlElement(): HTMLCanvasElement {
        const frontFabricHtmlElement = document.getElementById("front-fabric") as HTMLCanvasElement;
        assert.defined(frontFabricHtmlElement, "frontFabricHtmlElement");
        return frontFabricHtmlElement;
    }

    private buildFrontStitchHtmlElement(): HTMLCanvasElement {
        const frontStitchHtmlElement = document.getElementById("front-stitch") as HTMLCanvasElement;
        assert.defined(frontStitchHtmlElement, "frontStitchHtmlElement");
        return frontStitchHtmlElement;
    }

    private buildFrontCueHtmlElement(): HTMLElement {
        const frontCueHtmlElement = document.getElementById("front-cue") as HTMLElement;
        assert.defined(frontCueHtmlElement, "frontCueHtmlElement");
        return frontCueHtmlElement;
    }

    private buildBackFabricHtmlElement(): HTMLCanvasElement {
        const backFabricHtmlElement = document.getElementById("back-fabric") as HTMLCanvasElement;
        assert.defined(backFabricHtmlElement, "backFabricHtmlElement");
        return backFabricHtmlElement;
    }

    private buildBackStitchHtmlElement(): HTMLCanvasElement {
        const backStitchHtmlElement = document.getElementById("back-stitch") as HTMLCanvasElement;
        assert.defined(backStitchHtmlElement, "backStitchHtmlElement");
        return backStitchHtmlElement;
    }

    private buildBackCueHtmlElement(): HTMLElement {
        const backCueHtmlElement = document.getElementById("back-cue") as HTMLElement;
        assert.defined(backCueHtmlElement, "backCueHtmlElement");
        return backCueHtmlElement;
    }
}