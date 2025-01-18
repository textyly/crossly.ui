import { IVirtualCanvas } from "./canvas/virtual/types.js";
import { CrosslyCanvasBuilder } from "./canvas/builder.js";

export class CanvasBuilder {
    private crosslyCanvasBuilder: CrosslyCanvasBuilder;

    constructor() {
        this.crosslyCanvasBuilder = new CrosslyCanvasBuilder();
    }


    public build(): IVirtualCanvas {
        const inputCanvas = this.buildInputCanvas();
        this.crosslyCanvasBuilder.withInputCanvas(inputCanvas);

        const dotCanvas = this.buildDotCanvas();
        this.crosslyCanvasBuilder.withDotCanvas(dotCanvas);

        const lineCanvas = this.buildLineCanvas();
        this.crosslyCanvasBuilder.withLineCanvas(lineCanvas);

        const cueCanvas = this.buildCueCanvas();
        this.crosslyCanvasBuilder.withCueCanvas(cueCanvas);

        const virtualCanvas = this.crosslyCanvasBuilder.build();

        return virtualCanvas;
    }

    private buildInputCanvas(): HTMLElement {
        const htmlSvgCanvas = document.getElementById("input") as HTMLElement;
        return htmlSvgCanvas;
    }

    private buildDotCanvas(): HTMLCanvasElement {
        const htmlCanvasElement = document.getElementById("dot") as HTMLCanvasElement;
        return htmlCanvasElement;
    }

    private buildLineCanvas(): HTMLCanvasElement {
        const htmlCanvasElement = document.getElementById("line") as HTMLCanvasElement;
        return htmlCanvasElement;
    }

    private buildCueCanvas(): HTMLElement {
        const htmSvgCanvas = document.getElementById("cue") as HTMLElement;
        return htmSvgCanvas;
    }
}