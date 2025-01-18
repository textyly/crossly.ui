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
    private dotDrawingCanvas!: IDrawingCanvas<IDotVirtualCanvas>;

    private lineVirtualCanvas!: ILineVirtualCanvas;
    private lineDrawingCanvas!: IDrawingCanvas<ILineVirtualCanvas>;

    private cueVirtualCanvas!: ICueVirtualCanvas;
    private cueDrawingCanvas!: IDrawingCanvas<ICueVirtualCanvas>;

    constructor() {
        super();
    }

    public initialize(
        inputCanvas: IInputCanvas,
        dotDrawingCanvas: IDrawingCanvas<IDotVirtualCanvas>,
        lineDrawingCanvas: IDrawingCanvas<ILineVirtualCanvas>,
        cueDrawingCanvas: IDrawingCanvas<ICueVirtualCanvas>
    ): void {

        this.inputCanvas = inputCanvas;

        this.dotVirtualCanvas = new DotVirtualCanvas(this.inputCanvas);
        this.dotDrawingCanvas = dotDrawingCanvas;
        this.dotDrawingCanvas.subscribe(this.dotVirtualCanvas);

        this.lineVirtualCanvas = new LineVirtualCanvas(this.dotVirtualCanvas, this.inputCanvas);
        this.lineDrawingCanvas = lineDrawingCanvas;
        this.lineDrawingCanvas.subscribe(this.lineVirtualCanvas);

        this.cueVirtualCanvas = new CueVirtualCanvas(this.dotVirtualCanvas, this.inputCanvas);
        this.cueDrawingCanvas = cueDrawingCanvas;
        this.cueDrawingCanvas.subscribe(this.cueVirtualCanvas);

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

        this.dotDrawingCanvas?.dispose();
        this.lineDrawingCanvas?.dispose();
        this.cueDrawingCanvas?.dispose();

        super.dispose();
    }
}