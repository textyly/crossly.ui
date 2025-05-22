import { CanvasBase } from "../../base.js";
import assert from "../../../asserts/assert.js";
import { Id, BoundsChangeEvent, Dot, CueSegment } from "../../types.js";
import { ICueDrawingCanvas, IVectorDrawingCanvas, SvgDot, SvgLine } from "../types.js";
import {
    ICueCanvas,
    DrawCueDotEvent,
    RemoveCueDotEvent,
    MoveCueSegmentEvent,
    DrawCueSegmentEvent,
    RemoveCueSegmentEvent,
} from "../../virtual/types.js";

export abstract class CueDrawingCanvasBase extends CanvasBase implements ICueDrawingCanvas {
    private readonly cueCanvas: ICueCanvas;
    protected readonly vectorDrawing: IVectorDrawingCanvas;

    private readonly svgDots: Map<Id, SvgDot>;
    private readonly svgLines: Map<Id, SvgLine>;

    constructor(className: string, cueCanvas: ICueCanvas, vectorDrawing: IVectorDrawingCanvas) {
        super(className);

        this.cueCanvas = cueCanvas;
        this.vectorDrawing = vectorDrawing;

        this.svgDots = new Map<Id, SvgDot>();
        this.svgLines = new Map<Id, SvgLine>();

        this.subscribe();
    }

    public override dispose(): void {
        this.ensureAlive();
        this.clear();
        super.dispose();
    }

    protected abstract drawDot(dot: Dot, radius: number, color: string): SvgDot;
    protected abstract drawDashDot(dot: Dot, radius: number, color: string): SvgDot;
    protected abstract drawLine(thread: CueSegment): SvgLine;
    protected abstract drawDashLine(thread: CueSegment): SvgLine;

    private handleDrawDot(event: DrawCueDotEvent): void {
        this.ensureAlive();

        const dot = event.dot;
        const id = dot.id;

        const svgDot = this.drawDot(dot, event.dotRadius, event.dotColor);
        assert.defined(svgDot, "svgDot");

        this.svgDots.set(id, svgDot);
    }

    private handleDrawDashDot(event: DrawCueDotEvent): void {
        this.ensureAlive();

        const dot = event.dot;
        const id = dot.id;

        const svgDot = this.drawDashDot(dot, event.dotRadius, event.dotColor);
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

    private handleDrawSegment(event: DrawCueSegmentEvent): void {
        this.ensureAlive();

        const thread = event.segment;
        const id = thread.id;

        const svgLine = this.drawLine(thread);
        assert.defined(svgLine, "svgLine");

        this.svgLines.set(id, svgLine);
    }

    private handleMoveSegment(event: MoveCueSegmentEvent): void {
        this.ensureAlive();

        const thread = event.segment;
        const id = event.segment.id;

        const svgLine = this.svgLines.get(id);
        assert.defined(svgLine, "svgLine");

        this.vectorDrawing.moveLine(thread, svgLine);
    }

    private handleDrawDashSegment(event: DrawCueSegmentEvent): void {
        this.ensureAlive();

        const thread = event.segment;
        const id = thread.id;

        const svgLine = this.drawDashLine(thread);
        assert.defined(svgLine, "svgLine");

        this.svgLines.set(id, svgLine);
    }

    private handleRemoveSegment(event: RemoveCueSegmentEvent): void {
        this.ensureAlive();

        const id = event.segmentId;

        const svgLine = this.svgLines.get(id);
        assert.defined(svgLine, "svgLine");

        this.vectorDrawing.removeLine(svgLine);
        this.svgLines.delete(id);
    }

    private handleRedraw(): void {
        this.ensureAlive();
        this.clear();
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        this.ensureAlive();

        const bounds = event.bounds;
        super.bounds = bounds;

        this.vectorDrawing.bounds = bounds;
    }

    private clear(): void {
        this.ensureAlive();

        this.svgDots.forEach((dot) => {
            this.vectorDrawing.removeDot(dot);
        });

        this.svgLines.forEach((thread) => {
            this.vectorDrawing.removeLine(thread);
        });

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

        const drawSegmentUn = this.cueCanvas.onDrawSegment(this.handleDrawSegment.bind(this));
        super.registerUn(drawSegmentUn);

        const drawDashSegmentUn = this.cueCanvas.onDrawDashSegment(this.handleDrawDashSegment.bind(this));
        super.registerUn(drawDashSegmentUn);

        const moveSegmentUn = this.cueCanvas.onMoveSegment(this.handleMoveSegment.bind(this));
        super.registerUn(moveSegmentUn);

        const removeSegmentUn = this.cueCanvas.onRemoveSegment(this.handleRemoveSegment.bind(this));
        super.registerUn(removeSegmentUn);

        const redrawUn = this.cueCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const boundsChangeUn = this.cueCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);
    }
}