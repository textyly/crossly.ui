import { CanvasBase } from "../base.js";
import assert from "../../asserts/assert.js";
import { Id, BoundsChangeEvent } from "../types.js";
import { ICueDrawingCanvas, IVectorDrawingCanvas, SvgDot, SvgLine } from "./types.js";
import {
    ICueCanvas,
    DrawCueDotEvent,
    RemoveCueDotEvent,
    MoveCueThreadEvent,
    DrawCueThreadEvent,
    RemoveCueThreadEvent,
} from "../virtual/types.js";

export class CueDrawingCanvas extends CanvasBase implements ICueDrawingCanvas {
    private readonly cueCanvas: ICueCanvas;
    private readonly vectorDrawing: IVectorDrawingCanvas;

    private readonly svgDots: Map<Id, SvgDot>;
    private readonly svgLines: Map<Id, SvgLine>;

    constructor(cueCanvas: ICueCanvas, vectorDrawing: IVectorDrawingCanvas) {
        super();

        this.cueCanvas = cueCanvas;
        assert.defined(this.cueCanvas, "cueCanvas");

        this.vectorDrawing = vectorDrawing;
        assert.defined(this.vectorDrawing, "vectorDrawing");

        this.svgDots = new Map<Id, SvgDot>();
        this.svgLines = new Map<Id, SvgLine>();

        this.subscribe();
    }

    public override dispose(): void {
        this.ensureAlive();
        this.clear();
        super.dispose();
    }

    private handleDrawDot(event: DrawCueDotEvent): void {
        this.ensureAlive();

        const dot = event.dot;
        const id = dot.id;

        const svgDot = this.vectorDrawing.drawDot(dot, event.dotRadius, event.dotColor);
        assert.defined(svgDot, "svgDot");
        this.svgDots.set(id, svgDot);
    }

    private handleDrawDashDot(event: DrawCueDotEvent): void {
        this.ensureAlive();

        const dot = event.dot;
        const id = dot.id;

        const svgDot = this.vectorDrawing.drawDashDot(dot, event.dotRadius, event.dotColor);
        assert.defined(svgDot, "svgDot");
        this.svgDots.set(id, svgDot);
    }

    private handleRemoveDot(event: RemoveCueDotEvent): void {
        this.ensureAlive();

        const id = event.dotId;
        const svgDot = this.svgDots.get(id);
        assert.defined(svgDot, "svgDot");

        this.vectorDrawing.removeDot(svgDot);
        this.svgDots.delete(id);
    }

    private handleDrawThread(event: DrawCueThreadEvent): void {
        this.ensureAlive();

        const thread = event.thread;
        const id = thread.id;

        const svgLine = this.vectorDrawing.drawLine(thread);
        assert.defined(svgLine, "svgLine");
        this.svgLines.set(id, svgLine);
    }

    private handleMoveThread(event: MoveCueThreadEvent): void {
        this.ensureAlive();

        const thread = event.thread;
        const id = event.thread.id;

        const svgLine = this.svgLines.get(id);
        assert.defined(svgLine, "svgLine");
        this.vectorDrawing.moveLine(thread, svgLine);
    }

    private handleDrawDashThread(event: DrawCueThreadEvent): void {
        this.ensureAlive();

        const thread = event.thread;
        const id = thread.id;

        const svgLine = this.vectorDrawing.drawDashLine(thread);
        assert.defined(svgLine, "svgLine");
        this.svgLines.set(id, svgLine);
    }

    private handleRemoveThread(event: RemoveCueThreadEvent): void {
        this.ensureAlive();

        const id = event.threadId;

        const svgLine = this.svgLines.get(id);
        assert.defined(svgLine, "svgLine");
        this.vectorDrawing.removeLine(svgLine);
        this.svgLines.delete(id);
    }

    private handleRedraw(): void {
        this.ensureAlive();

        this.svgDots.forEach((dot) => {
            this.vectorDrawing.removeDot(dot);
        });

        this.svgLines.forEach((thread) => {
            this.vectorDrawing.removeLine(thread);
        });

        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        this.ensureAlive();

        const bounds = event.bounds;
        super.bounds = bounds;

        this.vectorDrawing.bounds = bounds;
    }

    private clear(): void {
        this.svgDots.clear();
        this.svgLines.clear();
    }

    private subscribe(): void {
        const drawDotUn = this.cueCanvas.onDrawDot(this.handleDrawDot.bind(this));
        super.registerUn(drawDotUn);

        const drawDashDotUn = this.cueCanvas.onDrawDashDot(this.handleDrawDashDot.bind(this));
        super.registerUn(drawDashDotUn);

        const removeDotUn = this.cueCanvas.onRemoveDot(this.handleRemoveDot.bind(this));
        super.registerUn(removeDotUn);

        const drawThreadUn = this.cueCanvas.onDrawThread(this.handleDrawThread.bind(this));
        super.registerUn(drawThreadUn);

        const drawDashThreadUn = this.cueCanvas.onDrawDashThread(this.handleDrawDashThread.bind(this));
        super.registerUn(drawDashThreadUn);

        const moveThreadUn = this.cueCanvas.onMoveThread(this.handleMoveThread.bind(this));
        super.registerUn(moveThreadUn);

        const removeThreadUn = this.cueCanvas.onRemoveThread(this.handleRemoveThread.bind(this));
        super.registerUn(removeThreadUn);

        const redrawUn = this.cueCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const boundsChangeUn = this.cueCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);
    }
}