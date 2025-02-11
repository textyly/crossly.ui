import { CueCanvasBase } from "./base.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { DotIndex, ICueCanvas } from "../types.js";
import { IInputCanvas, MoveEvent, PointerMoveEvent, PointerUpEvent, Position } from "../../input/types.js";
import { CanvasSide, Id, CueThread, CanvasConfig, CueDot } from "../../types.js";

export class CueCanvas extends CueCanvasBase implements ICueCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly ids: IdGenerator;

    private currentSide: CanvasSide;

    private currentThreadIndex?: { id: number, from: DotIndex & { id: number }, to: DotIndex & { id: number }, side: CanvasSide, width: number, color: string };
    private previouslyClickedDotIndex?: DotIndex & { id: number };
    private previouslyHoveredDotIndex?: DotIndex & { id: number };

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config);

        this.inputCanvas = inputCanvas;
        this.ids = new IdGenerator();

        this.currentSide = CanvasSide.Back;
        this.subscribe();
    }

    protected override redraw(): void {
        this.previouslyHoveredDotIndex = undefined;
        this.currentThreadIndex = undefined;
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
        const currentDotIndex = super.getDotIndex(position);
        const currentlyHoveredDot = !currentDotIndex ? undefined : super.getDotPositionByIndex(currentDotIndex);
        const previouslyHoveredDot = !this.previouslyHoveredDotIndex ? undefined : super.getDotPositionByIndex(this.previouslyHoveredDotIndex);

        if (!currentlyHoveredDot) {
            this.removeHoveredDot();
        } else if (currentlyHoveredDot.x !== previouslyHoveredDot?.x ||
            currentlyHoveredDot.y !== previouslyHoveredDot?.y
        ) {
            this.removeHoveredDot();
            const id = this.ids.next();
            const hoveredDot: CueDot = { id, ...currentlyHoveredDot };
            this.hoverDot(hoveredDot);
            this.previouslyHoveredDotIndex = { id, ...currentDotIndex };
        }
    }

    private clickDot(position: Position): void {
        const currentlyClickedDotIndex = super.getDotIndex(position);
        const currentlyClickedDot = !currentlyClickedDotIndex ? undefined : super.getDotPositionByIndex(currentlyClickedDotIndex);

        const previouslyClickedDotIndex = this.previouslyClickedDotIndex;
        const previouslyClickedDot = !previouslyClickedDotIndex ? undefined : super.getDotPositionByIndex(previouslyClickedDotIndex);

        // 1. check weather user has clicked on a dot and it is not the same as before
        if (currentlyClickedDot && (currentlyClickedDot.x !== previouslyClickedDot?.x || currentlyClickedDot.y !== previouslyClickedDot?.y)) {

            // 2. set the new clicked dot
            const id = previouslyClickedDotIndex?.id ?? this.ids.next();
            this.previouslyClickedDotIndex = { id, ...currentlyClickedDotIndex };

            // 3. change canvas side
            this.changeSide();

            // 4. handle dot logic, remove previously hovered dot and hover the clicked one
            this.removeHoveredDot();
            const hoveredDot: CueDot = { id, ...currentlyClickedDot };
            this.hoverDot(hoveredDot);

            // 5. handle thread logic, remove previously drawn thread and draw a new one
            this.removeCurrentThread();
            this.createOrResizeThread(position);
        }
    }

    private hoverDot(hoveredDot: CueDot): void {
        if (this.previouslyClickedDotIndex === undefined) {
            super.invokeDrawDashDot(hoveredDot, this._dotRadius, this._dotColor);
        } else {
            this.currentSide === CanvasSide.Front
                ? super.invokeDrawDot(hoveredDot, this._dotRadius, this._dotColor)
                : super.invokeDrawDashDot(hoveredDot, this._dotRadius, this._dotColor);
        }
    }

    private removeHoveredDot(): void {
        if (this.previouslyHoveredDotIndex) {
            const previouslyHoveredDotPosition = super.getDotPositionByIndex(this.previouslyHoveredDotIndex);
            const previouslyHoveredDot = { id: this.previouslyHoveredDotIndex.id, x: previouslyHoveredDotPosition.x, y: previouslyHoveredDotPosition.y, radius: this._dotRadius, color: this._dotColor };
            super.invokeRemoveDot(previouslyHoveredDot);
            this.previouslyHoveredDotIndex = undefined;
        }
    }

    private createOrResizeThread(position: Position): void {
        if (!this.previouslyClickedDotIndex) {
            return;
        }

        if (this.currentThreadIndex) {
            const dotIndex = super.getDotIndex(position)!;
            const toDotPosition = super.getDotPositionByIndex(dotIndex);

            const thread = this.createCurrentThread(this.previouslyClickedDotIndex, toDotPosition, this.currentThreadIndex.id);
            this.currentThreadIndex = { id: thread.id, from: this.previouslyClickedDotIndex, to: { id: thread.to.id, ...dotIndex }, side: this.currentSide, width: thread.width, color: thread.color };
            super.invokeMoveThread(thread);
        } else {
            const dotIndex = super.getDotIndex(position)!;
            const toDotPosition = super.getDotPositionByIndex(dotIndex);

            const threadId = this.ids.next();
            const thread = this.createCurrentThread(this.previouslyClickedDotIndex, toDotPosition, threadId);
            this.currentThreadIndex = { id: thread.id, from: this.previouslyClickedDotIndex, to: { id: thread.to.id, ...dotIndex }, side: this.currentSide, width: thread.width, color: thread.color };
            this.drawThread(thread);
        }
    }

    private createCurrentThread(previousClickedDotIndex: DotIndex & { id: number }, toDotPosition: Position, threadId: number): CueThread {
        const fromDotPosition = super.getDotPositionByIndex(previousClickedDotIndex);
        const fromDot = { id: previousClickedDotIndex.id, ...fromDotPosition };

        const dotId = this.ids.next();
        const toDot = { id: dotId, ...toDotPosition };

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
        if (this.currentThreadIndex) {
            const threadId = this.currentThreadIndex.id;
            const toDotPosition = super.getDotPositionByIndex(this.currentThreadIndex.to);
            const thread = this.createCurrentThread(this.currentThreadIndex.from, toDotPosition, threadId);
            super.invokeRemoveThread(thread);
            this.currentThreadIndex = undefined;
        }
    }

    private changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }
}