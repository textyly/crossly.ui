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
        this.handleDotClick(position);
    }

    private handleDotClick(position: Position): void {
        const clickedDotIndex = super.getDotIndex(position);
        const clickedDot = super.getDotPosition(clickedDotIndex);

        const previouslyClickedDotIndex = this.clickedDotIndex;
        if (previouslyClickedDotIndex) {

            const previouslyClickedDot = this.getDotPosition(previouslyClickedDotIndex);
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

        frontThreadsIndexes.forEach((threadIndex) => {
            const from = super.getDotPosition(threadIndex.from);
            const to = super.getDotPosition(threadIndex.to);

            const recalculated = { from, to, side: threadIndex.side, width: threadIndex.width, color: threadIndex.color };
            threads.push(recalculated);
        });

        super.invokeDrawThreads(threads, this.dotRadius);
    }

    private createThreadIndex(fromIndex: DotIndex, toIndex: DotIndex): ThreadIndex {
        const threadIndex = { from: fromIndex, to: toIndex, side: this.currentSide, width: this.threadWidth, color: this.threadColor };
        return threadIndex;
    }

    private createThread(from: Dot, to: Dot): StitchThread {
        const thread = { from, to, side: this.currentSide, width: this.threadWidth, color: this.threadColor };
        return thread;
    }

    private drawThread(thread: StitchThread): void {
        if (thread.side == CanvasSide.Front) {
            super.invokeDrawThreads([thread], this.dotRadius);
        }
    }
}