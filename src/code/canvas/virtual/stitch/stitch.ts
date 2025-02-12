import { StitchCanvasBase } from "./base.js";
import { DotIndex, IStitchCanvas } from "../types.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { Dot, CanvasSide, StitchThread, CanvasConfig } from "../../types.js";
import { IInputCanvas, PointerUpEvent, Position } from "../../input/types.js";

export class StitchCanvas extends StitchCanvasBase implements IStitchCanvas {
    private readonly dotsUtility: DotsUtility<Dot>;

    private threads: Array<{ from: DotIndex, to: DotIndex, side: CanvasSide, width: number, color: string }>;
    private clickedDot?: DotIndex;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);

        this.dotsUtility = new DotsUtility();

        this.threads = [];
        this.startListening();
    }

    public override dispose(): void {
        this.threads = [];
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
        const closestDotIndex = super.getDotIndex(position);
        const currentlyClickedDot = super.getDotPosition(closestDotIndex);

        if (!currentlyClickedDot) {
            return;
        }

        const previousClickedDot = !this.clickedDot ? undefined : this.getDotPosition(this.clickedDot);
        if (currentlyClickedDot.x === previousClickedDot?.x &&
            currentlyClickedDot.y === previousClickedDot?.y
        ) {
            return;
        }

        if (previousClickedDot !== undefined) {
            const threadIndex = { from: this.clickedDot!, to: closestDotIndex!, side: this.currentSide, width: this.threadWidth, color: this.threadColor };
            const thread = { from: previousClickedDot, to: currentlyClickedDot, side: this.currentSide, width: this.threadWidth, color: this.threadColor };
            this.threads.push(threadIndex);
            this.drawThread(thread);
        }

        this.clickedDot = closestDotIndex;
        this.changeSide();
    }

    private redrawThreads(): void {
        const frontThreadsIndexes = this.threads.filter((thread) => thread.side === CanvasSide.Front);

        const threads: Array<StitchThread> = [];

        frontThreadsIndexes.forEach((threadIndex) => {
            const from = super.getDotPosition(threadIndex.from)!;
            const to = super.getDotPosition(threadIndex.to)!;

            const recreated = { from, to, side: threadIndex.side, width: this.threadWidth, color: this.threadColor };
            threads.push(recreated);
        });

        super.invokeDrawThreads(threads, this.dotRadius);
    }

    private drawThread(thread: StitchThread): void {
        if (thread.side == CanvasSide.Front) {
            super.invokeDrawThreads([thread], this.dotRadius);
        }
    }
}