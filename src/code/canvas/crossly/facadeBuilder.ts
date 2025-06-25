import assert from "../../asserts/assert.js";
import { CrosslyCanvasConfig } from "../../config/types.js";
import { ICrosslyCanvasFacade } from "../types.js";
import { CrosslyCanvasBuilder } from "./canvasBuilder.js";

export class CrosslyCanvasFacadeBuilder {
    private readonly crosslyCanvasBuilder: CrosslyCanvasBuilder;
    private config!: CrosslyCanvasConfig;

    constructor() {
        this.crosslyCanvasBuilder = new CrosslyCanvasBuilder();
    }

    public build(): ICrosslyCanvasFacade {
        assert.defined(this.config, "config");
        return this.buildCore(this.config);
    }

    public withConfig(config: CrosslyCanvasConfig): CrosslyCanvasFacadeBuilder {
        this.config = config;
        return this;
    }

    private buildCore(config: CrosslyCanvasConfig): ICrosslyCanvasFacade {
        this.crosslyCanvasBuilder.withConfig(config);

        const frontInputHtmlElement = this.buildFrontInputHtmlElement();
        this.crosslyCanvasBuilder.withFrontInputCanvas(frontInputHtmlElement);

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

        const backSideViewHtmlElement = this.buildBackSideView();
        this.crosslyCanvasBuilder.withBackSideView(backSideViewHtmlElement);

        const crosslyCanvasFacade = this.crosslyCanvasBuilder.build();
        return crosslyCanvasFacade;
    }

    private buildFrontInputHtmlElement(): HTMLElement {
        const frontInputHtmlElement = document.querySelector("#front-input") as HTMLElement;
        assert.defined(frontInputHtmlElement, "inputHtmlElement");
        return frontInputHtmlElement;
    }

    private buildFrontFabricHtmlElement(): HTMLCanvasElement {
        const frontFabricHtmlElement = document.querySelector("#front-fabric") as HTMLCanvasElement;
        assert.defined(frontFabricHtmlElement, "frontFabricHtmlElement");
        return frontFabricHtmlElement;
    }

    private buildFrontStitchHtmlElement(): HTMLCanvasElement {
        const frontStitchHtmlElement = document.querySelector("#front-stitch") as HTMLCanvasElement;
        assert.defined(frontStitchHtmlElement, "frontStitchHtmlElement");
        return frontStitchHtmlElement;
    }

    private buildFrontCueHtmlElement(): HTMLElement {
        const frontCueHtmlElement = document.querySelector("#front-cue") as HTMLElement;
        assert.defined(frontCueHtmlElement, "frontCueHtmlElement");
        return frontCueHtmlElement;
    }

    private buildBackFabricHtmlElement(): HTMLCanvasElement {
        const backFabricHtmlElement = document.querySelector("#back-fabric") as HTMLCanvasElement;
        assert.defined(backFabricHtmlElement, "backFabricHtmlElement");
        return backFabricHtmlElement;
    }

    private buildBackStitchHtmlElement(): HTMLCanvasElement {
        const backStitchHtmlElement = document.querySelector("#back-stitch") as HTMLCanvasElement;
        assert.defined(backStitchHtmlElement, "backStitchHtmlElement");
        return backStitchHtmlElement;
    }

    private buildBackCueHtmlElement(): HTMLElement {
        const backCueHtmlElement = document.querySelector("#back-cue") as HTMLElement;
        assert.defined(backCueHtmlElement, "backCueHtmlElement");
        return backCueHtmlElement;
    }

    private buildBackSideView(): HTMLElement {
        const backSideViewHtmlElement = document.querySelector("#back-side-container") as HTMLElement;
        assert.defined(backSideViewHtmlElement, "backSideViewHtmlElement");
        return backSideViewHtmlElement;
    }
}