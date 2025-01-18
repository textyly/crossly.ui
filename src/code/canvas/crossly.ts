import { CueCanvas } from "./drawing/cue.js";
import { DotCanvas } from "./drawing/dot.js";
import { LineCanvas } from "./drawing/line.js";
import { IInputCanvas } from "./input/types.js";
import { IVirtualCanvas } from "./virtual/types.js";

export class CrosslyCanvas {
    private inputCanvas: IInputCanvas;
    private virtualCanvas: IVirtualCanvas;
    private dotCanvas: DotCanvas;
    private lineCanvas: LineCanvas;
    private cueCanvas: CueCanvas;

    constructor(
        inputCanvas: IInputCanvas,
        virtualCanvas: IVirtualCanvas,
        dotCanvas: DotCanvas,
        lineCanvas: LineCanvas,
        cueCanvas: CueCanvas,
    ) {
        this.inputCanvas = inputCanvas;
        this.virtualCanvas = virtualCanvas;
        this.dotCanvas = dotCanvas;
        this.lineCanvas = lineCanvas;
        this.cueCanvas = cueCanvas;
    }

    public draw(): void {
        this.virtualCanvas.draw();
    }

    public dispose() {
        this.inputCanvas?.dispose();
        this.virtualCanvas?.dispose();
        this.dotCanvas?.dispose();
        this.lineCanvas?.dispose();
        this.cueCanvas?.dispose();
    }
}