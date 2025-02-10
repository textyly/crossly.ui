import { CueCanvasBase } from "./base.js";
import { Converter } from "../../../utilities/converter.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { DrawGridDotsEvent, ICueCanvas, IGridCanvas } from "../types.js";
import { IInputCanvas, MoveEvent, PointerMoveEvent, PointerUpEvent, Position } from "../../input/types.js";
import { CanvasSide, Id, CueThread, BoundsChangeEvent, GridDot, CanvasConfig } from "../../types.js";

export class CueCanvas extends CueCanvasBase implements ICueCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly gridCanvas: IGridCanvas;

    private readonly ids: IdGenerator;
    private readonly converter: Converter;

    private currentSide: CanvasSide;
    private currentThread?: CueThread;

    private previouslyClickedDotId?: Id;
    private previouslyHoveredDotId?: Id;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas, gridCanvas: IGridCanvas) {
        super(config);

        this.inputCanvas = inputCanvas;
        this.gridCanvas = gridCanvas;

        this.ids = new IdGenerator();
        this.converter = new Converter();

        this.currentSide = CanvasSide.Back;

        this.subscribe();
    }

    protected override redraw(): void {
        this.ids.reset();

        this.previouslyHoveredDotId = undefined;

        if (this.currentThread) {
            // TODO: super messy code!!!
            const from = this.currentThread.from;
            const to = this.currentThread.to;

            this.currentThread = undefined;

            const id = this.ids.next();
            this.createCurrentThread(from, to, id);
        }
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const moveUn = this.inputCanvas.onMove(this.handleMove.bind(this));
        super.registerUn(moveUn);

        const pointerMoveUn = this.inputCanvas.onPointerMove(this.handlePointerMove.bind(this));
        super.registerUn(pointerMoveUn);

        const pointerUpUn = this.inputCanvas.onPointerUp(this.handlePointerUp.bind(this));
        super.registerUn(pointerUpUn);
    }

    private handleZoomIn(): void {
        super.zoomIn();
    }

    private handleZoomOut(): void {
        super.zoomOut();
    }

    private handleMove(event: MoveEvent): void {
        const difference = event.difference;
        super.move(difference);
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

    private moveDot(position: Position): void {
        const currentlyHoveredDot = this.gridCanvas.getDotByPosition(position);
        // console.log(`x: ${currentlyHoveredDot?.x}, y: ${currentlyHoveredDot?.y}`);

        const previouslyHoveredDot = this.gridCanvas.getDotById(this.previouslyHoveredDotId!);

        const test = super.getDotByPosition(position);
        // console.log(`newX: ${test?.x}, newY: ${test?.y}`);

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
            this.removeCurrentThread();
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
            this.currentThread = this.createCurrentThread(previousClickedDot, position, this.currentThread.id);
            super.invokeMoveThread(this.currentThread);
        } else {
            const threadId = this.ids.next();
            this.currentThread = this.createCurrentThread(previousClickedDot, position, threadId);
            this.drawThread(this.currentThread);
        }
    }

    private createCurrentThread(previousClickedDot: GridDot, currentPointerPosition: Position, threadId: Id): CueThread {
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

    private removeCurrentThread(): void {
        if (this.currentThread) {
            super.invokeRemoveThread(this.currentThread);
            this.currentThread = undefined;
        }
    }

    private changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }
}