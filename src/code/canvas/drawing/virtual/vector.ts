import { CanvasBase } from "../../base.js";
import { Dot, Bounds, Thread, Id } from "../../types.js";
import { IVectorDrawingCanvas, IVectorVirtualDrawingCanvas, SvgDot, SvgLine } from "../types.js";

export class VectorVirtualDrawingCanvas extends CanvasBase implements IVectorVirtualDrawingCanvas {
    private readonly vectorDrawingCanvas: IVectorDrawingCanvas;

    private readonly svgDots: Map<Id, SvgDot | undefined>;
    private readonly svgLines: Map<Id, SvgLine | undefined>;

    constructor(vectorDrawingCanvas: IVectorDrawingCanvas) {
        super();
        this.vectorDrawingCanvas = vectorDrawingCanvas;
        this.resizeVectorDrawingCanvas();

        this.svgDots = new Map<Id, SvgDot>();
        this.svgLines = new Map<Id, SvgLine>();
    }

    public drawDot(dot: Dot, radius: number, color: string): void {
        const isVisibleDot = this.isVisibleDot(dot);
        if (!isVisibleDot) {
            this.svgDots.set(dot.id, undefined);
        } else {
            const svgDot = this.vectorDrawingCanvas.drawDot(dot, radius, color);
            this.svgDots.set(dot.id, svgDot);
        }
    }

    public drawDashDot(dot: Dot, radius: number, color: string): void {
        const isVisibleDot = this.isVisibleDot(dot);
        if (!isVisibleDot) {
            this.svgDots.set(dot.id, undefined);
        } else {
            const svgDot = this.vectorDrawingCanvas.drawDashDot(dot, radius, color);
            this.svgDots.set(dot.id, svgDot);
        }
    }

    public removeDot(id: Id): void {
        const hasDot = this.svgDots.has(id);
        if (!hasDot) {
            throw new Error(`cannot be found dot with id: ${id}`);
        }

        const svgDot = this.svgDots.get(id);
        if (svgDot) {
            this.vectorDrawingCanvas.removeDot(svgDot);
        }
    }

    public drawLine(id: Id, thread: Thread<Dot>): void {
        const svgLine = this.vectorDrawingCanvas.drawLine(thread);
        this.svgLines.set(id, svgLine);
    }

    public drawDashLine(id: Id, thread: Thread<Dot>): void {
        const svgLine = this.vectorDrawingCanvas.drawDashLine(thread);
        this.svgLines.set(id, svgLine);
    }

    public moveLine(id: Id, thread: Thread<Dot>): void {
        const hasLine = this.svgLines.has(id);
        if (!hasLine) {
            throw new Error(`cannot be found line with id: ${id}`);
        }

        const svgLine = this.svgLines.get(id);
        if (svgLine) {
            this.vectorDrawingCanvas.moveLine(thread, svgLine);
        }
    }

    public removeLine(id: Id): void {
        const hasLine = this.svgLines.has(id);
        if (!hasLine) {
            throw new Error(`cannot be found line with id: ${id}`);
        }

        const svgLine = this.svgLines.get(id);
        if (svgLine) {
            this.vectorDrawingCanvas.removeLine(svgLine);
        }
    }

    public override dispose(): void {
        this.vectorDrawingCanvas.dispose();
        super.dispose();
    }

    protected override invokeBoundsChange(bounds: Bounds): void {
        super.invokeBoundsChange(bounds);
    }

    private resizeVectorDrawingCanvas(): void {
        // do not allow vector canvas to resize outside of the client visible area
        const x = 0;
        const y = 0;
        const width = ((window.innerWidth / 10) * 9.8);
        const height = ((window.innerHeight / 10) * 9.3);

        this.vectorDrawingCanvas.bounds = { x, y, width, height };
    }

    // TODO: extract in a different class
    private isVisibleDot(dot: Dot): boolean {
        const canvasX = this.vectorDrawingCanvas.bounds.x;
        const canvasY = this.vectorDrawingCanvas.bounds.y;
        const canvasWidth = this.vectorDrawingCanvas.bounds.width;
        const canvasHeight = this.vectorDrawingCanvas.bounds.height;

        const isVisibleByX = dot.x >= canvasX && dot.x <= canvasWidth;
        const isVisibleByY = dot.y >= canvasY && dot.y <= canvasHeight;

        return isVisibleByX && isVisibleByY;
    }
}