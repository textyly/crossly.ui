import { DotIndex } from "../types.js";
import { CueCanvasBase } from "./base.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { CanvasSide, Id, CueThread, CanvasConfig, CueDot, Dot } from "../../types.js";
import { Position, IInputCanvas, PointerUpEvent, PointerMoveEvent } from "../../input/types.js";

export class CueCanvas extends CueCanvasBase {
    private readonly ids: IdGenerator;
    private readonly dotsUtility: DotsUtility<Dot>;

    private currentThreadId?: Id;
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
        this.currentThreadId = undefined;

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
        const isInVirtualBounds = super.isInVirtualBounds(position);

        if (isInVirtualBounds) {
            this.moveDot(position);
            this.resizeThead(position);
        }
    }

    private handlePointerUp(event: PointerUpEvent): void {
        const position = event.position;
        const isInVirtualBounds = super.isInVirtualBounds(position);

        if (isInVirtualBounds) {
            const position = event.position;
            this.clickDot(position);
            this.removeThread();
        }
    }

    private moveDot(position: Position): void {
        // 1. remove previously hovered dot
        this.removeHoveredDot();

        // 2. get newly hovered dot's position
        const dotIndex = super.getDotIndex(position);
        const dotPosition = super.getDotPosition(dotIndex);

        this.hoverDot(dotPosition, dotIndex);
    }

    private clickDot(position: Position): void {
        const clickedDotIndex = super.getDotIndex(position);
        const clickedDot = super.getDotPosition(clickedDotIndex);
        const previouslyClickedDotIndex = this.clickedDotIndex;

        if (!previouslyClickedDotIndex) {
            // TODO: move in a method
            this.changeSide();
            this.removeHoveredDot();
            this.hoverDot(clickedDot, clickedDotIndex);

        } else {
            const previouslyClickedDot = super.getDotPosition(previouslyClickedDotIndex);
            const areIdenticalClicks = this.dotsUtility.areDotsEqual(clickedDot, previouslyClickedDot);

            if (!areIdenticalClicks) {
                this.changeSide();
                this.removeHoveredDot();
                this.hoverDot(clickedDot, clickedDotIndex);
            }
        }

        this.clickedDotIndex = clickedDotIndex;
    }

    private hoverDot(dot: Dot, dotIndex: DotIndex): void {
        const id = this.ids.next();
        const hoveredDot: CueDot = { id, ...dot };

        this.currentSide === CanvasSide.Back
            ? super.invokeDrawDashDot(hoveredDot, this.dotRadius, this.dotColor)
            : super.invokeDrawDot(hoveredDot, this.dotRadius, this.dotColor);


        this.hoveredDotIndex = { id, ...dotIndex };
    }

    private resizeThead(toPosition: Position): void {
        if (this.clickedDotIndex) {
            const fromDotIndex = this.clickedDotIndex;
            const fromPosition = super.getDotPosition(fromDotIndex);

            let thread: CueThread;
            if (this.currentThreadId) {
                const threadId = this.currentThreadId;
                thread = this.createThread(fromPosition, toPosition, threadId);
                super.invokeMoveThread(thread);
            } else {
                const threadId = this.ids.next();
                thread = this.createThread(fromPosition, toPosition, threadId);
                this.drawThread(thread);
            }
            this.currentThreadId = thread.id;
        }
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
        if (this.currentThreadId) {
            super.invokeRemoveThread(this.currentThreadId);
            this.currentThreadId = undefined;
        }
    }
}