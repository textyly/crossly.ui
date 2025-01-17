import { CanvasBase } from "../../base.js";
import { Size } from "../../types.js";

export abstract class SvgCanvasBase extends CanvasBase {
    protected svgCanvas: HTMLElement;

    constructor(svgCanvas: HTMLElement) {
        super();

        this.svgCanvas = svgCanvas;
    }

    public override set size(value: Size) {
        super.size = value;
        const width = value.width.toString();
        const height = value.height.toString();

        this.svgCanvas.setAttribute("width", width);
        this.svgCanvas.setAttribute("height", height);
    }
}