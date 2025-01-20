import { ICrosslyCanvas } from "./canvas/types.js";
import { CrosslyCanvasBuilder } from "./canvas/builder.js";

export class CanvasBuilder {
    private readonly crosslyCanvasBuilder: CrosslyCanvasBuilder;

    constructor() {
        this.crosslyCanvasBuilder = new CrosslyCanvasBuilder();
    }

    public build(): ICrosslyCanvas {
        // TODO: add validator
        const inputHTMLElement = this.buildInputHTMLElement();
        this.crosslyCanvasBuilder.withInputCanvas(inputHTMLElement);

        const dotHTMLElement = this.buildDotHTMLElement();
        this.crosslyCanvasBuilder.withDotCanvas(dotHTMLElement);

        const lineHTMLElement = this.buildLineHTMLElement();
        this.crosslyCanvasBuilder.withLineCanvas(lineHTMLElement);

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
        const htmlCanvasElement = document.getElementById("dot") as HTMLCanvasElement;
        return htmlCanvasElement;
    }

    private buildLineHTMLElement(): HTMLCanvasElement {
        const htmlCanvasElement = document.getElementById("line") as HTMLCanvasElement;
        return htmlCanvasElement;
    }

    private buildCueHTMLElement(): HTMLElement {
        const htmSvgCanvas = document.getElementById("cue") as HTMLElement;
        return htmSvgCanvas;
    }
}