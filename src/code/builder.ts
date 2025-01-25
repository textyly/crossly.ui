import { CrosslyCanvasBuilder } from "./canvas/builder.js";
import { CanvasConfig, ICrosslyCanvas } from "./canvas/types.js";

export class CanvasBuilder {
    private readonly crosslyCanvasBuilder: CrosslyCanvasBuilder;

    private config!: CanvasConfig;

    constructor() {
        this.crosslyCanvasBuilder = new CrosslyCanvasBuilder();
    }

    public build(): ICrosslyCanvas {
        const inputHTMLElement = this.buildInputHTMLElement();
        this.crosslyCanvasBuilder.withInputCanvas(inputHTMLElement);

        const gridDotsHTMLElement = this.buildGridDotsHTMLElement();
        const gridLinesHTMLElement = this.buildGridLinesHTMLElement();
        this.crosslyCanvasBuilder.withGridCanvas(gridDotsHTMLElement, gridLinesHTMLElement);

        const lineHTMLElement = this.buildStitchHTMLElement();
        this.crosslyCanvasBuilder.withStitchCanvas(lineHTMLElement);

        const cueHTMLElement = this.buildCueHTMLElement();
        this.crosslyCanvasBuilder.withCueCanvas(cueHTMLElement);

        this.crosslyCanvasBuilder.withConfig(this.config);
        const crosslyCanvas = this.crosslyCanvasBuilder.build();
        return crosslyCanvas;
    }

    public withConfig(config: CanvasConfig): CanvasBuilder {
        this.config = config;
        return this;
    }

    private buildInputHTMLElement(): HTMLElement {
        const htmlSvgElement = document.getElementById("input") as HTMLElement;
        return htmlSvgElement;
    }

    private buildGridDotsHTMLElement(): HTMLCanvasElement {
        const htmlCanvasElement = document.getElementById("grid-dots") as HTMLCanvasElement;
        return htmlCanvasElement;
    }

    private buildGridLinesHTMLElement(): HTMLElement {
        const htmlCanvasElement = document.getElementById("grid-lines") as HTMLElement;
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