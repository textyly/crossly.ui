import assert from "../../asserts/assert.js";
import html from "../../utilities.ts/html.js";
import { ICrosslyCanvasFacade } from "../types.js";
import { CrosslyCanvasBuilder } from "./canvasBuilder.js";
import { CrosslyCanvasConfig } from "../../config/types.js";

export class CrosslyCanvasFacadeBuilder {
    private readonly document: Document;
    private readonly crosslyCanvasBuilder: CrosslyCanvasBuilder;

    private readonly frontInputId = "front-input";
    private readonly frontFabricId = "front-fabric";
    private readonly frontStitchId = "front-stitch";
    private readonly frontCueId = "front-cue";
    private readonly backSideId = "back-side-container";
    private readonly backFabricId = "back-fabric";
    private readonly backStitchId = "back-stitch";
    private readonly backCueId = "back-cue";

    private config!: CrosslyCanvasConfig;

    constructor(document: Document) {
        this.document = document;
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

        const frontInputHtmlElement = html.getById<HTMLElement>(this.document, this.frontInputId);
        this.crosslyCanvasBuilder.withFrontInputCanvas(frontInputHtmlElement);

        const frontFabricHtmlElement = html.getById<HTMLCanvasElement>(this.document, this.frontFabricId);
        this.crosslyCanvasBuilder.withFrontFabricCanvas(frontFabricHtmlElement);

        const frontStitchHtmlElement = html.getById<HTMLCanvasElement>(this.document, this.frontStitchId);
        this.crosslyCanvasBuilder.withFrontStitchCanvas(frontStitchHtmlElement);

        const frontCueHtmlElement = html.getById<HTMLElement>(this.document, this.frontCueId);
        this.crosslyCanvasBuilder.withFrontCueCanvas(frontCueHtmlElement);

        const backFabricHtmlElement = html.getById<HTMLCanvasElement>(this.document, this.backFabricId);
        this.crosslyCanvasBuilder.withBackFabricCanvas(backFabricHtmlElement);

        const backStitchHtmlElement = html.getById<HTMLCanvasElement>(this.document, this.backStitchId);
        this.crosslyCanvasBuilder.withBackStitchCanvas(backStitchHtmlElement);

        const backCueHtmlElement = html.getById<HTMLElement>(this.document, this.backCueId);
        this.crosslyCanvasBuilder.withBackCueCanvas(backCueHtmlElement);

        const backSideViewHtmlElement = html.getById<HTMLElement>(this.document, this.backSideId);
        this.crosslyCanvasBuilder.withBackSideView(backSideViewHtmlElement);

        const crosslyCanvasFacade = this.crosslyCanvasBuilder.build();
        return crosslyCanvasFacade;
    }
}