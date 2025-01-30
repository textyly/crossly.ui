import { CanvasBase } from "../../base.js";
import { IInputCanvas } from "../../input/types.js";
import { Dot, Size, Thread } from "../../types.js";
import { IRasterDrawing } from "../types.js";

export class VirtualRasterDrawing extends CanvasBase implements IRasterDrawing {
    private readonly inputCanvas: IInputCanvas;
    private readonly rasterDrawing: IRasterDrawing;

    constructor(inputCanvas: IInputCanvas, rasterDrawing: IRasterDrawing) {
        super();
        this.inputCanvas = inputCanvas;
        this.rasterDrawing = rasterDrawing;
        this.subscribe();
    }

    public drawDots(dots: Array<Dot>): void {
        this.rasterDrawing.drawDots(dots);
    }

    public drawLines(threads: Array<Thread<Dot>>): void {
        this.rasterDrawing.drawLines(threads);
    }

    public clear(): void {
        this.rasterDrawing.clear();
    }

    public override dispose(): void {
        this.rasterDrawing.dispose();
        super.dispose();
    }

    protected override invokeSizeChange(size: Size): void {
        super.invokeSizeChange(size);
        this.rasterDrawing.size = size;
    }

    private subscribe(): void {
        this.inputCanvas.onVisibleAreaChange((event) => {
            // TODO:
        });
    }
}