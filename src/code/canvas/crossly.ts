import { CanvasBase } from "./base.js";
import { IDrawingCanvas } from "./drawing/types.js";
import { IInputCanvas } from "./input/types.js";
import { ICrosslyCanvas, Size } from "./types.js";
import { CueVirtualCanvas } from "./virtual/cue/cue.js";
import { DotVirtualCanvas } from "./virtual/dot/dot.js";
import { LineVirtualCanvas } from "./virtual/line/line.js";
import { DotsConfig, ICueVirtualCanvas, IDotVirtualCanvas, ILineVirtualCanvas } from "./virtual/types.js";

export class CrosslyCanvas extends CanvasBase implements ICrosslyCanvas {
    private inputCanvas!: IInputCanvas;

    private dotVirtualCanvas!: IDotVirtualCanvas;
    private dotCanvas!: IDrawingCanvas<IDotVirtualCanvas>;

    private lineVirtualCanvas!: ILineVirtualCanvas;
    private lineCanvas!: IDrawingCanvas<ILineVirtualCanvas>;

    private cueCanvas!: IDrawingCanvas<ICueVirtualCanvas>;
    private cueVirtualCanvas!: ICueVirtualCanvas;

    constructor() {
        super();
    }

    public initialize(
        inputCanvas: IInputCanvas,
        dotCanvas: IDrawingCanvas<IDotVirtualCanvas>,
        lineCanvas: IDrawingCanvas<ILineVirtualCanvas>,
        cueCanvas: IDrawingCanvas<ICueVirtualCanvas>
    ): void {

        this.inputCanvas = inputCanvas;

        this.dotCanvas = dotCanvas;
        this.dotVirtualCanvas = new DotVirtualCanvas(this.inputCanvas);
        this.dotCanvas.subscribe(this.dotVirtualCanvas);

        this.lineCanvas = lineCanvas;
        this.lineVirtualCanvas = new LineVirtualCanvas(this.dotVirtualCanvas, this.inputCanvas);
        this.lineCanvas.subscribe(this.lineVirtualCanvas);

        this.cueCanvas = cueCanvas;
        this.cueVirtualCanvas = new CueVirtualCanvas(this.dotVirtualCanvas, this.inputCanvas);
        this.cueCanvas.subscribe(this.cueVirtualCanvas);

        const sizeChangedUn = this.dotVirtualCanvas.onSizeChange(this.handleDotVirtualCanvasSizeChange.bind(this));
        super.registerUn(sizeChangedUn);
    }

    public draw(dotsConfig: DotsConfig): void {
        this.dotVirtualCanvas.draw(dotsConfig);
    }

    private handleDotVirtualCanvasSizeChange(size: Size): void {
        super.size = size;
        this.inputCanvas.size = size;
    }

    public override dispose() {
        this.inputCanvas?.dispose();

        this.dotVirtualCanvas?.dispose();
        this.lineVirtualCanvas?.dispose();
        this.cueVirtualCanvas?.dispose();

        this.dotCanvas?.dispose();
        this.lineCanvas?.dispose();
        this.cueCanvas?.dispose();

        super.dispose();
    }
}