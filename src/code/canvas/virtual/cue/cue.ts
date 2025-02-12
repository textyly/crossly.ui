import { DotIndex } from "../types.js";
import { CueCanvasBase } from "./base.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { CanvasSide, Id, CueThread, CanvasConfig, CueDot, Dot } from "../../types.js";
import { Position, IInputCanvas, PointerUpEvent, PointerMoveEvent } from "../../input/types.js";

export class CueCanvas extends CueCanvasBase {
    private readonly ids: IdGenerator;
    private readonly dotsUtility: DotsUtility<Dot>;

    private threadId?: Id;
    private clickedDotIndex?: DotIndex;
    private hoveredDotIndex?: DotIndex & { id: Id };

    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);

        this.ids = new IdGenerator();
        this.dotsUtility = new DotsUtility();

        this.startListening();
    }

    protected override redraw(): void {
        // 1. remove hovered dot and thread
        const dotIndex = this.hoveredDotIndex;
        this.hoveredDotIndex = undefined;
        this.threadId = undefined;

        // 2. recreate hovered dot and thread
        if (dotIndex) {
            const position = super.getDotPosition(dotIndex);
            this.handlePointerMove({ position });
        }
    }

    private startListening(): void {
        const pointerMoveUn = this.inputCanvas.onPointerMove(this.handlePointerMove.bind(this));
        super.registerUn(pointerMoveUn);

        const pointerUpUn = this.inputCanvas.onPointerUp(this.handlePointerUp.bind(this));
        super.registerUn(pointerUpUn);
    }

    private handlePointerMove(event: PointerMoveEvent): void {
        const position = event.position;
        this.moveDot(position);
        this.resizeThead(position);
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

        // TODO: move in a method
        // 3. create and hover а new dot
        const isDashDot = this.currentSide === CanvasSide.Back;
        const hoveredDot = this.createAndHoverDot(dotPosition, isDashDot);

        // 4. remember the newly hovered dot so that it can be removed next moveDot invocation
        this.hoveredDotIndex = { id: hoveredDot.id, ...dotIndex };
        // --------------------
    }

    private clickDot(position: Position): void {
        const clickedDotIndex = super.getDotIndex(position);
        const clickDot = super.getDotPosition(clickedDotIndex);
        const previouslyClickedDotIndex = this.clickedDotIndex;

        if (!previouslyClickedDotIndex) {
            // TODO: move in a method
            this.changeSide();
            this.removeHoveredDot();

            const isDashDot = false;
            const hoveredDot = this.createAndHoverDot(clickDot, isDashDot);
            this.hoveredDotIndex = { id: hoveredDot.id, ...clickedDotIndex };
            // --------------------

        } else {
            const previouslyClickedDot = super.getDotPosition(previouslyClickedDotIndex);
            const areIdenticalClicks = this.dotsUtility.areDotsEqual(clickDot, previouslyClickedDot);

            if (!areIdenticalClicks) {
                // TODO: move in a method
                this.changeSide();
                this.removeHoveredDot();

                const isDashDot = this.currentSide === CanvasSide.Back;
                const hoveredDot = this.createAndHoverDot(clickDot, isDashDot);
                this.hoveredDotIndex = { id: hoveredDot.id, ...clickedDotIndex };
                // --------------------
            }
        }

        this.clickedDotIndex = clickedDotIndex;
    }

    private createAndHoverDot(dotPosition: Position, isDashDot: boolean): CueDot {
        const id = this.ids.next();
        const hoveredDot: CueDot = { id, ...dotPosition };

        isDashDot
            ? super.invokeDrawDashDot(hoveredDot, this.dotRadius, this.dotColor)
            : super.invokeDrawDot(hoveredDot, this.dotRadius, this.dotColor);

        return hoveredDot;
    }

    private resizeThead(position: Position): void {
        if (this.clickedDotIndex) {
            const fromDotIndex = this.clickedDotIndex;
            const toPosition = position;
            this.createOrResizeThread(fromDotIndex, toPosition);
        }
    }

    private createOrResizeThread(fromDotIndex: DotIndex, toPosition: Position): void {
        const fromPosition = super.getDotPosition(fromDotIndex);

        let thread: CueThread;
        if (this.threadId) {
            const threadId = this.threadId;
            thread = this.createThread(fromPosition, toPosition, threadId);
            super.invokeMoveThread(thread);
        } else {
            const threadId = this.ids.next();
            thread = this.createThread(fromPosition, toPosition, threadId);
            this.drawThread(thread);
        }
        this.threadId = thread.id;
    }

    private createThread(from: Position, to: Position, id: number): CueThread {
        const thread = { id, from, to, width: this.threadWidth, color: this.threadColor };
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