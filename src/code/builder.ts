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
        assert.isDefined(this.config, "config");
        this.crosslyCanvasBuilder.withConfig(this.config);

        const inputHTMLElement = this.buildInputHTMLElement();
        this.crosslyCanvasBuilder.withInputCanvas(inputHTMLElement);

        const fabricHTMLElement = this.buildFabricHTMLElement();
        this.crosslyCanvasBuilder.withFabricCanvas(fabricHTMLElement);

        const stitchHTMLElement = this.buildStitchHTMLElement();
        this.crosslyCanvasBuilder.withStitchCanvas(stitchHTMLElement);

        const cueHTMLElement = this.buildCueHTMLElement();
        this.crosslyCanvasBuilder.withCueCanvas(cueHTMLElement);

        const crosslyCanvas = this.crosslyCanvasBuilder.build();
        return crosslyCanvas;
    }

    public withConfig(config: CrosslyCanvasConfig): CanvasBuilder {
        this.config = config;
        assert.isDefined(this.config, "config");
        return this;
    }

    private buildInputHTMLElement(): HTMLElement {
        const htmlSvgElement = document.getElementById("crossly") as HTMLElement;
        assert.isDefined(htmlSvgElement, "htmlSvgElement");
        return htmlSvgElement;
    }

    private buildFabricHTMLElement(): HTMLCanvasElement {
        const htmlCanvasElement = document.getElementById("fabric") as HTMLCanvasElement;
        assert.isDefined(htmlCanvasElement, "htmlCanvasElement");
        return htmlCanvasElement;
    }

    private buildStitchHTMLElement(): HTMLCanvasElement {
        const htmlCanvasElement = document.getElementById("stitch") as HTMLCanvasElement;
        assert.isDefined(htmlCanvasElement, "htmlCanvasElement");
        return htmlCanvasElement;
    }

    private buildCueHTMLElement(): HTMLElement {
        const htmSvgCanvas = document.getElementById("cue") as HTMLElement;
        assert.isDefined(htmSvgCanvas, "htmSvgCanvas");
        return htmSvgCanvas;
    }
}