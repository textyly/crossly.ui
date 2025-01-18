import { CanvasBase } from "./base.js";
import { CueCanvas } from "./drawing/cue.js";
import { DotCanvas } from "./drawing/dot.js";
import { LineCanvas } from "./drawing/line.js";
import { IInputCanvas } from "./input/types.js";
import { Size } from "./types.js";
import { CueVirtualCanvas } from "./virtual/cue/cue.js";
import { DotVirtualCanvas } from "./virtual/dot/dot.js";
import { LineVirtualCanvas } from "./virtual/line/line.js";
import { DotsConfig, ICueVirtualCanvas, IDotVirtualCanvas, ILineVirtualCanvas } from "./virtual/types.js";

export class CrosslyCanvas extends CanvasBase {
    private readonly inputCanvas: IInputCanvas;
    private readonly dotCanvas: DotCanvas;
    private readonly lineCanvas: LineCanvas;
    private readonly cueCanvas: CueCanvas;

    private dotVirtualCanvas!: IDotVirtualCanvas;
    private lineVirtualCanvas!: ILineVirtualCanvas;
    private cueVirtualCanvas!: ICueVirtualCanvas;

    constructor(inputCanvas: IInputCanvas, dotCanvas: DotCanvas, lineCanvas: LineCanvas, cueCanvas: CueCanvas) {
        super();

        this.inputCanvas = inputCanvas;
        this.dotCanvas = dotCanvas;
        this.lineCanvas = lineCanvas;
        this.cueCanvas = cueCanvas;

        this.dotVirtualCanvas = new DotVirtualCanvas(this.inputCanvas);
        this.lineVirtualCanvas = new LineVirtualCanvas(this.dotVirtualCanvas, this.inputCanvas);
        this.cueVirtualCanvas = new CueVirtualCanvas(this.dotVirtualCanvas, this.inputCanvas);
    }

    public initialize(): void {
        this.dotCanvas.subscribe(this.dotVirtualCanvas);
        this.lineCanvas.subscribe(this.lineVirtualCanvas);
        this.cueCanvas.subscribe(this.cueVirtualCanvas);

        const dotCanvasSizeChangedUn = this.dotVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(dotCanvasSizeChangedUn);
    }

    public draw(dotsConfig: DotsConfig): void {
        this.dotVirtualCanvas.draw(dotsConfig);
    }

    private handleSizeChange(size: Size): void {
        super.size = size;
        this.inputCanvas.size = size;
    }

    public dispose() {
        this.inputCanvas?.dispose();

        this.dotVirtualCanvas?.dispose();
        this.lineVirtualCanvas?.dispose();
        this.cueVirtualCanvas?.dispose();

        this.dotCanvas?.dispose();
        this.lineCanvas?.dispose();
        this.cueCanvas?.dispose();
    }
}