import { CanvasBase } from "./base.js";
import { IInputCanvas } from "./input/types.js";
import { IDrawingCanvas } from "./drawing/types.js";
import { CueVirtualCanvas } from "./virtual/cue/cue.js";
import { DotVirtualCanvas } from "./virtual/dot/dot.js";
import { LineVirtualCanvas } from "./virtual/line/line.js";
import { ICrosslyCanvas, SizeChangeEvent } from "./types.js";
import { DotsConfig, ICueVirtualCanvas, IDotVirtualCanvas, ILineVirtualCanvas } from "./virtual/types.js";

export class CrosslyCanvas extends CanvasBase implements ICrosslyCanvas {
    private readonly inputCanvas: IInputCanvas;

    private dotVirtualCanvas!: IDotVirtualCanvas;
    private dotDrawingCanvas!: IDrawingCanvas<IDotVirtualCanvas>;

    private lineVirtualCanvas!: ILineVirtualCanvas;
    private lineDrawingCanvas!: IDrawingCanvas<ILineVirtualCanvas>;

    private cueVirtualCanvas!: ICueVirtualCanvas;
    private cueDrawingCanvas!: IDrawingCanvas<ICueVirtualCanvas>;

    constructor(
        inputCanvas: IInputCanvas,
        dotDrawingCanvas: IDrawingCanvas<IDotVirtualCanvas>,
        lineDrawingCanvas: IDrawingCanvas<ILineVirtualCanvas>,
        cueDrawingCanvas: IDrawingCanvas<ICueVirtualCanvas>) {

        super();

        this.inputCanvas = inputCanvas;
        this.initializeDotCanvas(dotDrawingCanvas);
        this.initializeLineCanvas(lineDrawingCanvas);
        this.initializeCueCanvas(cueDrawingCanvas);
    }

    public draw(dotsConfig: DotsConfig): void {
        this.dotVirtualCanvas.draw(dotsConfig);
    }

    public override dispose(): void {
        this.disposeCueCanvas();
        this.disposeLineCanvas();
        this.disposeDotCanvas();

        this.inputCanvas?.dispose();

        super.dispose();
    }

    private initializeDotCanvas(dotDrawingCanvas: IDrawingCanvas<IDotVirtualCanvas>): void {
        this.dotDrawingCanvas = dotDrawingCanvas;
        this.dotVirtualCanvas = new DotVirtualCanvas(this.inputCanvas);
        this.dotDrawingCanvas.subscribe(this.dotVirtualCanvas);

        const sizeChangeUn = this.dotVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    private initializeLineCanvas(lineDrawingCanvas: IDrawingCanvas<ILineVirtualCanvas>): void {
        this.lineDrawingCanvas = lineDrawingCanvas;
        this.lineVirtualCanvas = new LineVirtualCanvas(this.dotVirtualCanvas, this.inputCanvas);
        this.lineDrawingCanvas.subscribe(this.lineVirtualCanvas);
    }

    private initializeCueCanvas(cueDrawingCanvas: IDrawingCanvas<ICueVirtualCanvas>): void {
        this.cueDrawingCanvas = cueDrawingCanvas;
        this.cueVirtualCanvas = new CueVirtualCanvas(this.dotVirtualCanvas, this.inputCanvas);
        this.cueDrawingCanvas.subscribe(this.cueVirtualCanvas);
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
        this.inputCanvas.size = size;
    }

    private disposeCueCanvas(): void {
        this.cueVirtualCanvas?.dispose();
        this.cueDrawingCanvas?.dispose();
    }

    private disposeLineCanvas(): void {
        this.lineVirtualCanvas?.dispose();
        this.lineDrawingCanvas?.dispose();
    }

    private disposeDotCanvas(): void {
        this.dotVirtualCanvas?.dispose();
        this.dotDrawingCanvas?.dispose();
    }
}