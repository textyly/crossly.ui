import { CanvasBase } from "../../base.js";
import { IInputCanvas } from "../../input/types.js";
import { Dot, Size, Thread } from "../../types.js";
import { IVectorDrawing, SvgDot, SvgLine } from "../types.js";

export class VirtualVectorDrawing extends CanvasBase implements IVectorDrawing {
    private readonly inputCanvas: IInputCanvas;
    private readonly vectorDrawing: IVectorDrawing;

    constructor(inputCanvas: IInputCanvas, vectorDrawing: IVectorDrawing) {
        super();
        this.inputCanvas = inputCanvas;
        this.vectorDrawing = vectorDrawing;
        this.subscribe();
    }

    public drawDot(dot: Dot): SvgDot {
        return this.vectorDrawing.drawDot(dot);
    }

    public drawDashDot(dot: Dot): SvgDot {
        return this.vectorDrawing.drawDashDot(dot);
    }

    public removeDot(dot: SvgDot): void {
        this.vectorDrawing.removeDot(dot);
    }

    public drawLine(thread: Thread<Dot>): SvgLine {
        return this.vectorDrawing.drawLine(thread);
    }

    public drawDashLine(thread: Thread<Dot>): SvgLine {
        return this.vectorDrawing.drawDashLine(thread);
    }

    public moveLine(thread: Thread<Dot>, svgLine: SvgLine): void {
        this.vectorDrawing.moveLine(thread, svgLine);
    }

    public removeLine(thread: SvgLine): void {
        this.vectorDrawing.removeLine(thread);
    }

    public override dispose(): void {
        this.vectorDrawing.dispose();
        super.dispose();
    }

    protected override invokeSizeChange(size: Size): void {
        super.invokeSizeChange(size);
        this.vectorDrawing.size = size;
    }

    private subscribe(): void {
        this.inputCanvas.onVisibleAreaChange((event) => {
            // TODO:
        });
    }
}