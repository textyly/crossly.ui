import { DotIndex } from "../types.js";
import { StitchCanvasBase } from "./base.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { IInputCanvas, PointerUpEvent, Position } from "../../input/types.js";
import { Dot, CanvasSide, StitchThread, CanvasConfig, Id } from "../../types.js";

type InternalThread = { width: number, color: string, side: CanvasSide, dotRadius: number };
type ThreadIndex = { internalThreadId: Id, from: DotIndex, to: DotIndex, side: CanvasSide };

export class StitchCanvas extends StitchCanvasBase {
    private readonly ids: IdGenerator; // will be used 
    private readonly dotsUtility: DotsUtility<Dot>;

    private readonly internalThreads: Map<Id, InternalThread>;
    private threadIndexes: Array<ThreadIndex>;

    private clickedDotIndex?: DotIndex;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);

        this.ids = new IdGenerator();
        this.dotsUtility = new DotsUtility();

        this.internalThreads = new Map<Id, InternalThread>();
        this.threadIndexes = new Array<ThreadIndex>();

        this.startListening();
    }

    public override dispose(): void {
        this.internalThreads.clear();
        this.threadIndexes = [];
        super.dispose();
    }

    protected override redraw(): void {
        const frontThreadsIndexes = this.threadIndexes.filter((threadIndex) => threadIndex.side === CanvasSide.Front);

        this.redrawThreads(frontThreadsIndexes);
        // TODO: do not draw dots on move!!!
        this.redrawThreadsDots(frontThreadsIndexes);
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
                const thread = this.createThread(previouslyClickedDot, clickedDot);

                const internalThreadId = 0; // must change id color, width and/or dotRadius has changed by the user
                const threadEx: InternalThread = { dotRadius: this.dotRadius, ...thread };
                this.internalThreads.set(internalThreadId, threadEx);

                const threadIndex = this.createThreadIndex(internalThreadId, previouslyClickedDotIndex, clickedDotIndex);
                this.threadIndexes.push(threadIndex);

                if (this.currentSide == CanvasSide.Front) {
                    super.invokeDrawThreads([thread]);
                    super.invokeDrawDots([thread.from.x, thread.to.x], [thread.from.y, thread.to.y], this.dotRadius, this.threadColor);
                }
            }
        }

        this.clickedDotIndex = clickedDotIndex;
        this.changeSide();
    }

    private redrawThreads(threadsIndexes: Array<ThreadIndex>): void {
        const threads = new Array<StitchThread>();

        threadsIndexes.forEach((threadIndex) => {
            const internalThread = this.internalThreads.get(threadIndex.internalThreadId)!;
            const thread = this.recalculateThread(threadIndex, internalThread);
            threads.push(thread);
        });

        // TODO: draw only visible threads
        super.invokeDrawThreads(threads);
    }

    private redrawThreadsDots(threadsIndexes: Array<ThreadIndex>): void {
        this.internalThreads.forEach((internalThread, internalThreadId) => {

            // TODO: delete already filtered threads (perf optimization)
            const threadsIndexesById = threadsIndexes.filter((threadIndex) => threadIndex.internalThreadId === internalThreadId);

            const dotsX = new Array<number>();
            const dotsY = new Array<number>();

            threadsIndexesById.forEach((threadIndex) => {
                const from = super.calculateDotPosition(threadIndex.from);
                dotsX.push(from.x);
                dotsY.push(from.y);

                const to = super.calculateDotPosition(threadIndex.to);
                dotsX.push(to.x);
                dotsY.push(to.y);
            });

            const color = internalThread.color;
            const dotRadius = this.recalculateDotRadius(internalThread.dotRadius);

            this.invokeDrawDots(dotsX, dotsY, dotRadius, color);
        });
    }

    private recalculateThread(threadIndex: ThreadIndex, internalThread: InternalThread): StitchThread {
        const from = super.calculateDotPosition(threadIndex.from);
        const to = super.calculateDotPosition(threadIndex.to);

        const thread = {
            from,
            to,
            side: internalThread.side,
            width: this.threadWidth, // internalThread.threadWidth +-threadWidthZoomStep
            color: internalThread.color
        };

        return thread;
    }

    private createThreadIndex(internalThreadId: number, fromIndex: DotIndex, toIndex: DotIndex): ThreadIndex {
        const threadIndex = { internalThreadId, from: fromIndex, to: toIndex, side: this.currentSide };
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

    private recalculateDotRadius(radius: number): number {
        // TODO: radius +- dotRadiusZoomStep
        const newRadius = this.dotRadius;
        return newRadius;
    }
}