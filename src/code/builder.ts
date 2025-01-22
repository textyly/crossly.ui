import { ICrosslyCanvas } from "./canvas/types.js";
import { CrosslyCanvasBuilder } from "./canvas/builder.js";

export class CanvasBuilder {
    private readonly crosslyCanvasBuilder: CrosslyCanvasBuilder;

    constructor() {
        this.crosslyCanvasBuilder = new CrosslyCanvasBuilder();
    }

    public build(): ICrosslyCanvas {
        const inputHTMLElement = this.buildInputHTMLElement();
        this.crosslyCanvasBuilder.withInputCanvas(inputHTMLElement);

        const dotHTMLElement = this.buildDotHTMLElement();
        this.crosslyCanvasBuilder.withGridCanvas(dotHTMLElement);

        const lineHTMLElement = this.buildLineHTMLElement();
        this.crosslyCanvasBuilder.withStitchCanvas(lineHTMLElement);

        const cueHTMLElement = this.buildCueHTMLElement();
        this.crosslyCanvasBuilder.withCueCanvas(cueHTMLElement);

        const crosslyCanvas = this.crosslyCanvasBuilder.build();
        return crosslyCanvas;
    }

    private buildInputHTMLElement(): HTMLElement {
        const htmlSvgElement = document.getElementById("input") as HTMLElement;
        return htmlSvgElement;
    }

    private buildDotHTMLElement(): HTMLCanvasElement {
        const htmlCanvasElement = document.getElementById("grid") as HTMLCanvasElement;
        return htmlCanvasElement;
    }

    private buildLineHTMLElement(): HTMLCanvasElement {
        const htmlCanvasElement = document.getElementById("stitch") as HTMLCanvasElement;
        return htmlCanvasElement;
    }

    private buildCueHTMLElement(): HTMLElement {
        const htmSvgCanvas = document.getElementById("cue") as HTMLElement;
        return htmSvgCanvas;
    }
}