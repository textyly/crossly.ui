import { CueCanvasBase } from "./base.js";
import { DotIndex, ICueCanvas } from "../types.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { CanvasSide, Id, CueThread, CanvasConfig, CueDot, Dot } from "../../types.js";
import {
    Position,
    MoveEvent,
    IInputCanvas,
    PointerUpEvent,
    PointerMoveEvent,
} from "../../input/types.js";

export class CueCanvas extends CueCanvasBase implements ICueCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly ids: IdGenerator;
    private readonly dotsUtility: DotsUtility<Dot>;

    private threadId?: Id;
    private clickedDotIndex?: DotIndex;
    private hoveredDotIndex?: DotIndex & { id: Id };

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config);

        this.inputCanvas = inputCanvas;
        this.ids = new IdGenerator();
        this.dotsUtility = new DotsUtility();

        this.subscribe();
    }

    protected override redraw(): void {
        // 1. remove hovered dot and thread
        const dotIndex = this.hoveredDotIndex;
        this.hoveredDotIndex = undefined;
        this.threadId = undefined;

        // 2. recreate hovered dot and thread
        if (dotIndex) {
            const position = super.getDotPosition(dotIndex);
            const event = { position };
            this.handlePointerMove(event);
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
        this.removeThread();
    }

    private moveDot(position: Position): void {
        // 1. remove previously hovered dot
        this.removeHoveredDot();

        // 2. get newly hovered dot's position
        const dotIndex = super.getDotIndex(position);
        const dotPosition = super.getDotPosition(dotIndex);

        // 3. create and hover а new dot
        const isDashDot = this.currentSide === CanvasSide.Back;
        const hoveredDot = this.createAndHoverDot(dotPosition, isDashDot);

        // 4. remember the newly hovered dot so that it can be removed next moveDot invocation
        this.hoveredDotIndex = { id: hoveredDot.id, ...dotIndex };
    }

    private clickDot(position: Position): void {
        const dotIndex = super.getDotIndex(position);
        const dotPosition = super.getDotPosition(dotIndex);
        const previouslyClickedDotIndex = this.clickedDotIndex;

        if (!previouslyClickedDotIndex) {

            this.changeSide();
            this.removeHoveredDot();

            const isDashDot = false;
            const hoveredDot = this.createAndHoverDot(dotPosition, isDashDot);
            this.hoveredDotIndex = { id: hoveredDot.id, ...dotIndex };

        } else {
            const previouslyClickedDot = super.getDotPosition(previouslyClickedDotIndex);
            const areEqual = this.dotsUtility.areDotEqual(dotPosition, previouslyClickedDot);

            if (!areEqual) {
                this.changeSide();
                this.removeHoveredDot();

                const isDashDot = this.currentSide === CanvasSide.Back;
                const hoveredDot = this.createAndHoverDot(dotPosition, isDashDot);
                this.hoveredDotIndex = { id: hoveredDot.id, ...dotIndex };
            }
        }

        this.clickedDotIndex = dotIndex;
    }

    private createAndHoverDot(dotPosition: Position, isDashDot: boolean): CueDot {
        const id = this.ids.next();
        const hoveredDot: CueDot = { id, ...dotPosition };

        isDashDot
            ? super.invokeDrawDashDot(hoveredDot, this.dotRadius, this.dotColor)
            : super.invokeDrawDot(hoveredDot, this.dotRadius, this.dotColor);

        return hoveredDot;
    }

    private createOrResizeThread(position: Position): void {
        if (this.clickedDotIndex) {

            let thread: CueThread;

            if (this.threadId) {
                const threadId = this.threadId;
                thread = this.createThread(this.clickedDotIndex, position, threadId);
                super.invokeMoveThread(thread);
            } else {
                const threadId = this.ids.next();
                thread = this.createThread(this.clickedDotIndex, position, threadId);
                this.drawThread(thread);
            }

            this.threadId = thread.id;
        }
    }

    private createThread(fromDotIndex: DotIndex, toDotPosition: Position, threadId: number): CueThread {
        const fromDotPosition = super.getDotPosition(fromDotIndex);

        const thread = {
            id: threadId,
            from: fromDotPosition,
            to: toDotPosition,
            width: this.threadWidth,
            color: this.threadColor
        };

        return thread;
    }

    private drawThread(thread: CueThread): void {
        if (this.currentSide === CanvasSide.Front) {
            super.invokeDrawThread(thread);
        } else {
            super.invokeDrawDashThread(thread);
        }
    }

    private removeHoveredDot(): void {
        if (this.hoveredDotIndex) {
            const dotId = this.hoveredDotIndex.id;
            super.invokeRemoveDot(dotId);
            this.hoveredDotIndex = undefined;
        }
    }

    private removeThread(): void {
        if (this.threadId) {
            super.invokeRemoveThread(this.threadId);
            this.threadId = undefined;
        }
    }
}