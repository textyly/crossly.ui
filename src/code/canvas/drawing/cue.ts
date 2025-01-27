import { CanvasBase } from "../base.js";
import { Id, SizeChangeEvent } from "../types.js";
import { ICueDrawingCanvas, IVectorDrawing, SvgDot, SvgLine } from "./types.js";
import { DrawCueDotEvent, DrawCueThreadEvent, ICueCanvas, RemoveCueDotEvent, RemoveCueThreadEvent } from "../virtual/types.js";

export class CueDrawingCanvas extends CanvasBase implements ICueDrawingCanvas {
    private readonly vectorDrawing: IVectorDrawing;
    private readonly svgDots: Map<Id, SvgDot>;
    private readonly svgLines: Map<Id, SvgLine>;

    constructor(vectorDrawing: IVectorDrawing) {
        super();
        this.vectorDrawing = vectorDrawing;
        this.svgDots = new Map<Id, SvgDot>();
        this.svgLines = new Map<Id, SvgLine>();
    }

    public subscribe(cueCanvas: ICueCanvas): void {
        const drawDotUn = cueCanvas.onDrawDot(this.handleDrawDot.bind(this));
        super.registerUn(drawDotUn);
        
        const drawDashDotUn = cueCanvas.onDrawDashDot(this.handleDrawDashDot.bind(this));
        super.registerUn(drawDashDotUn);

        const removeDotUn = cueCanvas.onRemoveDot(this.handleRemoveDot.bind(this));
        super.registerUn(removeDotUn);

        const drawThreadUn = cueCanvas.onDrawThread(this.handleDrawThread.bind(this));
        super.registerUn(drawThreadUn);

        const drawDashThreadUn = cueCanvas.onDrawDashThread(this.handleDrawDashThread.bind(this));
        super.registerUn(drawDashThreadUn);

        const moveThreadUn = cueCanvas.onMoveThread(this.handleMoveThread.bind(this));
        super.registerUn(moveThreadUn);

        const removeThreadUn = cueCanvas.onRemoveThread(this.handleRemoveThread.bind(this));
        super.registerUn(removeThreadUn);

        const redrawUn = cueCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const sizeChangeUn = cueCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawDot(event: DrawCueDotEvent): void {
        const dot = event.dot;
        const id = dot.id;

        const svgDot = this.vectorDrawing.drawDot(dot);
        this.svgDots.set(id, svgDot);
    }

    private handleDrawDashDot(event: DrawCueDotEvent): void {
        const dot = event.dot;
        const id = dot.id;

        const svgDot = this.vectorDrawing.drawDashDot(dot);
        this.svgDots.set(id, svgDot);
    }

    private handleRemoveDot(event: RemoveCueDotEvent): void {
        const dot = event.dot;
        const id = dot.id;

        if (this.svgDots.has(id)) {
            const svgDot = this.svgDots.get(id);
            this.vectorDrawing.removeDot(svgDot!);
            this.svgDots.delete(id);
        }
    }

    private handleDrawThread(event: DrawCueThreadEvent): void {
        const thread = event.thread;
        const id = thread.id;

        const svgLine = this.vectorDrawing.drawLine(thread);
        this.svgLines.set(id, svgLine);
    }

    private handleMoveThread(event: DrawCueThreadEvent): void {
        const thread = event.thread;
        const id = thread.id;

        if (this.svgLines.has(id)) {
            const svgLine = this.svgLines.get(id);
            this.vectorDrawing.moveLine(thread, svgLine!);
        }
    }

    private handleDrawDashThread(event: DrawCueThreadEvent): void {
        const thread = event.thread;
        const id = thread.id;

        const svgLine = this.vectorDrawing.drawDashLine(thread);
        this.svgLines.set(id, svgLine);
    }

    private handleRemoveThread(event: RemoveCueThreadEvent): void {
        const thread = event.thread;
        const id = thread.id;

        if (this.svgLines.has(id)) {
            const svgLine = this.svgLines.get(id);
            this.vectorDrawing.removeLine(svgLine!);
            this.svgLines.delete(id);
        }
    }

    private handleRedraw(): void {
        this.svgDots.forEach((dot) => this.vectorDrawing.removeDot(dot));
        this.svgLines.forEach((line) => this.vectorDrawing.removeLine(line));
        this.clear();
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
        this.vectorDrawing.size = size;
    }

    private clear(): void {
        this.svgDots.clear();
        this.svgLines.clear();
    }
}