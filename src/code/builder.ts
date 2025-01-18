import { CrosslyCanvasBuilder } from "./canvas/builder.js";
import { CrosslyCanvas } from "./canvas/crossly.js";

export class CanvasBuilder {
    private crosslyCanvasBuilder: CrosslyCanvasBuilder;

    constructor() {
        this.crosslyCanvasBuilder = new CrosslyCanvasBuilder();
    }

    public build(): CrosslyCanvas {
        const inputHTMLElement = this.buildInputHTMLElement();
        this.crosslyCanvasBuilder.withInputCanvas(inputHTMLElement);

        const dotHTMLElement = this.buildDotHTMLElement();
        this.crosslyCanvasBuilder.withDotCanvas(dotHTMLElement);

        const lineHTMLElement = this.buildLineHTMLElement();
        this.crosslyCanvasBuilder.withLineCanvas(lineHTMLElement);

        const cueHTMLElement = this.buildCueHTMLElement();
        this.crosslyCanvasBuilder.withCueCanvas(cueHTMLElement);

        const virtualCanvas = this.crosslyCanvasBuilder.build();
        return virtualCanvas;
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