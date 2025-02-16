import { StitchCanvasBase } from "./base.js";
import { DotIndex, ThreadIndex } from "../types.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { Dot, CanvasSide, StitchThread, CanvasConfig } from "../../types.js";
import { IInputCanvas, PointerUpEvent, Position } from "../../input/types.js";

export class StitchCanvas extends StitchCanvasBase {
    private readonly dotsUtility: DotsUtility<Dot>;

    private threadIndexes: Array<ThreadIndex>;
    private clickedDotIndex?: DotIndex;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);

        this.dotsUtility = new DotsUtility();
        this.threadIndexes = new Array<ThreadIndex>();

        this.startListening();
    }

    public override dispose(): void {
        this.threadIndexes = [];
        super.dispose();
    }

    protected override redraw(): void {
        this.redrawThreads();
    }

    private startListening(): void {
        const pointerUpUn = this.inputCanvas.onPointerUp(this.handlePointerUp.bind(this));
        super.registerUn(pointerUpUn);
    }

    private handlePointerUp(event: PointerUpEvent): void {
        const position = event.position;
        const isInVirtualBounds = super.isInVirtualBounds(position);

        if (isInVirtualBounds) {
            this.handleDotClick(position);
        }
    }

    private handleDotClick(position: Position): void {
        const clickedDotIndex = super.calculateDotIndex(position);
        const clickedDot = super.calculateDotPosition(clickedDotIndex);

        const previouslyClickedDotIndex = this.clickedDotIndex;
        if (previouslyClickedDotIndex) {

            const previouslyClickedDot = this.calculateDotPosition(previouslyClickedDotIndex);
            const areIdenticalClicks = this.dotsUtility.areDotsEqual(clickedDot, previouslyClickedDot);

            if (!areIdenticalClicks) {

                const threadIndex = this.createThreadIndex(previouslyClickedDotIndex, clickedDotIndex);
                this.threadIndexes.push(threadIndex);

                const thread = this.createThread(previouslyClickedDot, clickedDot);
                this.drawThread(thread);
            }
        }

        this.clickedDotIndex = clickedDotIndex;
        this.changeSide();
    }

    private redrawThreads(): void {
        const frontThreadsIndexes = this.threadIndexes.filter((thread) => thread.side === CanvasSide.Front);
        const threads = new Array<StitchThread>();
        const dotsX = new Array<number>();
        const dotsY = new Array<number>();

        frontThreadsIndexes.forEach((threadIndex) => {
            const thread = this.recalculateThread(threadIndex);
            threads.push(thread);

            dotsX.push(thread.from.x);
            dotsY.push(thread.from.y);

            dotsX.push(thread.to.x);
            dotsY.push(thread.to.y);
        });

        super.invokeDrawThreads(threads);
    }

    private recalculateThread(threadIndex: ThreadIndex): StitchThread {
        const from = super.calculateDotPosition(threadIndex.from);
        const to = super.calculateDotPosition(threadIndex.to);

        // TODO: each thread can have different thread width. recalculated with is threadWidth + threadWidthZoomStep
        // TODO: same for dotsRadius
        const thread = {
            from,
            to,
            dotRadius: this.dotRadius,
            side: threadIndex.side,
            width: this.threadWidth,
            color: threadIndex.color
        };

        return thread;
    }

    private createThreadIndex(fromIndex: DotIndex, toIndex: DotIndex): ThreadIndex {
        const threadIndex = {
            from: fromIndex,
            to: toIndex,
            side: this.currentSide,
            width: this.threadWidth,
            color: this.threadColor
        };

        return threadIndex;
    }

    private createThread(fromDot: Dot, toDot: Dot): StitchThread {
        const thread = {
            from: { ...fromDot, radius: this.dotRadius },
            to: { ...toDot, radius: this.dotRadius },
            dotRadius: this.dotRadius,
            side: this.currentSide,
            width: this.threadWidth,
            color: this.threadColor
        };

        return thread;
    }

    private drawThread(thread: StitchThread): void {
        if (thread.side == CanvasSide.Front) {
            super.invokeDrawThreads([thread]);
        }
    }
}