import { CanvasBase } from "../base.js";
import { Id, BoundsChangeEvent, CueDot, CueThread } from "../types.js";
import { ICueDrawingCanvas, IVectorVirtualDrawingCanvas } from "./types.js";
import { DrawCueDotEvent, DrawCueThreadEvent, ICueCanvas, RemoveCueDotEvent, RemoveCueThreadEvent } from "../virtual/types.js";

export class CueDrawingCanvas extends CanvasBase implements ICueDrawingCanvas {
    private readonly vectorVirtualDrawing: IVectorVirtualDrawingCanvas;

    private readonly dots: Map<Id, CueDot>;
    private readonly threads: Map<Id, CueThread>;

    constructor(vectorVirtualDrawing: IVectorVirtualDrawingCanvas) {
        super();
        this.vectorVirtualDrawing = vectorVirtualDrawing;

        this.dots = new Map<Id, CueDot>();
        this.threads = new Map<Id, CueThread>();
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

        const boundsChangeUn = cueCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);
    }

    public override dispose(): void {
        this.clear();
        super.dispose();
    }

    private handleDrawDot(event: DrawCueDotEvent): void {
        const dot = event.dot;
        const id = dot.id;

        this.vectorVirtualDrawing.drawDot(dot);
        this.dots.set(id, dot);
    }

    private handleDrawDashDot(event: DrawCueDotEvent): void {
        const dot = event.dot;
        const id = dot.id;

        this.vectorVirtualDrawing.drawDashDot(dot);
        this.dots.set(id, dot);
    }

    private handleRemoveDot(event: RemoveCueDotEvent): void {
        const id = event.dot.id;

        this.vectorVirtualDrawing.removeDot(id);
        this.dots.delete(id);
    }

    private handleDrawThread(event: DrawCueThreadEvent): void {
        const thread = event.thread;
        const id = thread.id;

        this.vectorVirtualDrawing.drawLine(id, thread);
        this.threads.set(id, thread);
    }

    private handleMoveThread(event: DrawCueThreadEvent): void {
        const thread = event.thread;
        const id = thread.id;

        this.vectorVirtualDrawing.moveLine(id, thread);
    }

    private handleDrawDashThread(event: DrawCueThreadEvent): void {
        const thread = event.thread;
        const id = thread.id;

        this.vectorVirtualDrawing.drawDashLine(id, thread);
        this.threads.set(id, thread);
    }

    private handleRemoveThread(event: RemoveCueThreadEvent): void {
        const thread = event.thread;
        const id = thread.id;

        this.vectorVirtualDrawing.removeLine(id);
        this.threads.delete(id);
    }

    private handleRedraw(): void {
        this.dots.forEach((dot) => {
            this.vectorVirtualDrawing.removeDot(dot.id);
        });

        this.threads.forEach((thread) => {
            this.vectorVirtualDrawing.removeLine(thread.id);
        });

        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        const bounds = event.bounds;
        super.bounds = bounds;

        this.vectorVirtualDrawing.bounds = bounds;
    }

    private clear(): void {
        this.dots.clear();
        this.threads.clear();
    }
}