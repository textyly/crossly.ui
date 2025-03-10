import { CrosslyCanvasBuilder } from "./canvas/builder.js";
import { CrosslyCanvasConfig, ICrosslyCanvas } from "./canvas/types.js";

export class CanvasBuilder {
    private readonly crosslyCanvasBuilder: CrosslyCanvasBuilder;

    private config!: CrosslyCanvasConfig;

    constructor() {
        this.crosslyCanvasBuilder = new CrosslyCanvasBuilder();
    }

    public build(): ICrosslyCanvas {
        const inputHTMLElement = this.buildInputHTMLElement();
        this.crosslyCanvasBuilder.withInputCanvas(inputHTMLElement);

        const fabricHTMLElement = this.buildFabricHTMLElement();
        this.crosslyCanvasBuilder.withFabricCanvas(fabricHTMLElement);

        const stitchHTMLElement = this.buildStitchHTMLElement();
        this.crosslyCanvasBuilder.withStitchCanvas(stitchHTMLElement);

        const cueHTMLElement = this.buildCueHTMLElement();
        this.crosslyCanvasBuilder.withCueCanvas(cueHTMLElement);

        this.crosslyCanvasBuilder.withConfig(this.config);
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