import { CueCanvasBase } from "./base.js";
import { Converter } from "../../../utilities/converter.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { DrawGridDotsEvent, ICueCanvas, IGridCanvas } from "../types.js";
import { IInputCanvas, PointerMoveEvent, PointerUpEvent, Position } from "../../input/types.js";
import { CanvasSide, Id, CueThread, BoundsChangeEvent, GridDot, CueCanvasConfig } from "../../types.js";

export class CueCanvas extends CueCanvasBase implements ICueCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly gridCanvas: IGridCanvas;

    private readonly ids: IdGenerator;
    private readonly converter: Converter;

    private currentSide: CanvasSide;
    private currentThread?: CueThread;

    private previouslyClickedDotId?: Id;
    private previouslyHoveredDotId?: Id;

    constructor(config: CueCanvasConfig, inputCanvas: IInputCanvas, gridCanvas: IGridCanvas) {
        super(config);

        this.inputCanvas = inputCanvas;
        this.gridCanvas = gridCanvas;

        this.ids = new IdGenerator();
        this.converter = new Converter();

        this.currentSide = CanvasSide.Back;

        this.subscribe();
    }

    public override draw(): void {
        this.redraw();
    }

    private redraw(): void {
        this.ids.reset();

        const previouslyHovered = this.gridCanvas.getDotById(this.previouslyHoveredDotId!);
        this.removeDot(previouslyHovered);

        if (this.currentThread) {
            const position = this.currentThread.to;
            this.createOrResizeThread(position);
        }
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const pointerMoveUn = this.inputCanvas.onPointerMove(this.handlePointerMove.bind(this));
        super.registerUn(pointerMoveUn);

        const pointerUpUn = this.inputCanvas.onPointerUp(this.handlePointerUp.bind(this));
        super.registerUn(pointerUpUn);

        const virtualBoundsChangeUn = this.gridCanvas.onVirtualBoundsChange(this.handleVirtualBoundsChange.bind(this));
        super.registerUn(virtualBoundsChangeUn);

        const drawDosUn = this.gridCanvas.onDrawDots(this.handleDrawDots.bind(this));
        super.registerUn(drawDosUn);
    }

    private handleZoomIn(): void {
        super.zoomIn();
    }

    private handleZoomOut(): void {
        super.zoomOut();
    }

    private handlePointerMove(event: PointerMoveEvent): void {
        const position = event.position;
        this.moveDot(position);
        this.createOrResizeThread(position);
    }

    private handlePointerUp(event: PointerUpEvent): void {
        const position = event.position;
        this.clickDot(position);
    }

    private handleVirtualBoundsChange(event: BoundsChangeEvent): void {
        this.virtualBounds = event.bounds;
    }

    private handleDrawDots(event: DrawGridDotsEvent): void {
        this.draw();
    }

    private moveDot(position: Position): void {
        const currentlyHoveredDot = this.gridCanvas.getDotByPosition(position);
        const previouslyHoveredDot = this.gridCanvas.getDotById(this.previouslyHoveredDotId!);

        if (!currentlyHoveredDot) {
            this.removeDot(previouslyHoveredDot);
        } else if (currentlyHoveredDot.id !== previouslyHoveredDot?.id) {
            this.removeDot(previouslyHoveredDot);
            this.hoverDot(currentlyHoveredDot);
        }
    }

    private clickDot(position: Position): void {
        const currentlyClickedDot = this.gridCanvas.getDotByPosition(position);
        const previouslyClickedDot = this.gridCanvas.getDotById(this.previouslyClickedDotId!);
        const previouslyHoveredDot = this.gridCanvas.getDotById(this.previouslyHoveredDotId!);

        // 1. check weather user has clicked on a dot and it is not the same as before
        if (currentlyClickedDot && (currentlyClickedDot.id !== previouslyClickedDot?.id)) {

            // 2. set the new clicked dot
            this.previouslyClickedDotId = currentlyClickedDot.id;

            // 3. change canvas side
            this.changeSide();

            // 4. handle dot logic, remove previously hovered dot and hover the clicked one
            this.removeDot(previouslyHoveredDot);
            this.hoverDot(currentlyClickedDot);

            // 5. handle thread logic, remove previously drawn thread and draw a new one
            this.removeThread();
            this.createOrResizeThread(position);
        }
    }

    private hoverDot(hoveredDot: GridDot): void {
        const hovered = { id: hoveredDot.id, x: hoveredDot.x, y: hoveredDot.y, radius: this._dotRadius, color: this._dotColor };

        if (this.previouslyClickedDotId === undefined) {
            super.invokeDrawDashDot(hovered, this._dotRadius, this._dotColor);
        } else {
            this.currentSide === CanvasSide.Front
                ? super.invokeDrawDot(hovered, this._dotRadius, this._dotColor)
                : super.invokeDrawDashDot(hovered, this._dotRadius, this._dotColor);
        }

        this.previouslyHoveredDotId = hoveredDot.id;
    }

    private removeDot(hoveredDot?: GridDot): void {
        if (hoveredDot) {
            super.invokeRemoveDot(hoveredDot);
            this.previouslyHoveredDotId = undefined;
        }
    }

    private createOrResizeThread(position: Position): void {
        const previousClickedDot = this.gridCanvas.getDotById(this.previouslyClickedDotId!);
        if (!previousClickedDot) {
            return;
        }

        if (this.currentThread) {
            this.currentThread = this.createThread(previousClickedDot, position, this.currentThread.id);
            super.invokeMoveThread(this.currentThread);
        } else {
            const threadId = this.ids.next();
            this.currentThread = this.createThread(previousClickedDot, position, threadId);
            this.drawThread(this.currentThread);
        }
    }

    private createThread(previousClickedDot: GridDot, currentPointerPosition: Position, threadId: Id): CueThread {
        const fromDot = this.converter.convertToCueDot(previousClickedDot);

        const toDotId = this.ids.next();
        const toDot = { ...currentPointerPosition, id: toDotId, radius: this._dotRadius, color: this._dotColor };

        const thread = { id: threadId, from: fromDot, to: toDot, width: this._threadWidth, color: this._threadColor };
        return thread;
    }

    private drawThread(thread: CueThread): void {
        if (this.currentSide === CanvasSide.Front) {
            super.invokeDrawThread(thread);
        } else {
            super.invokeDrawDashThread(thread);
        }
    }

    private removeThread(): void {
        if (this.currentThread) {
            super.invokeRemoveThread(this.currentThread);
            this.currentThread = undefined;
        }
    }

    private changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }
}