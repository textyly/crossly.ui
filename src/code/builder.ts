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
        return this;
    }

    private buildInputHTMLElement(): HTMLElement {
        const htmlSvgElement = document.getElementById("crossly") as HTMLElement;
        return htmlSvgElement;
    }

    private buildFabricHTMLElement(): HTMLCanvasElement {
        const htmlCanvasElement = document.getElementById("fabric") as HTMLCanvasElement;
        return htmlCanvasElement;
    }

    private buildStitchHTMLElement(): HTMLCanvasElement {
        const htmlCanvasElement = document.getElementById("stitch") as HTMLCanvasElement;
        return htmlCanvasElement;
    }

    private buildCueHTMLElement(): HTMLElement {
        const htmSvgCanvas = document.getElementById("cue") as HTMLElement;
        return htmSvgCanvas;
    }
}