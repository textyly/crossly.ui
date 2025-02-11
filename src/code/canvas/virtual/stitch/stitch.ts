import { StitchCanvasBase } from "./base.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { DotIndex, DrawGridDotsEvent, IGridCanvas, IStitchCanvas } from "../types.js";
import { IInputCanvas, MoveEvent, PointerUpEvent, Position } from "../../input/types.js";
import {
    Id,
    CanvasSide,
    StitchThread,
    CanvasConfig,
    BoundsChangeEvent,
    Dot,
} from "../../types.js";

export class StitchCanvas extends StitchCanvasBase implements IStitchCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly dotsUtility: DotsUtility<Dot>;

    private threads: Array<{ from: DotIndex, to: DotIndex, side: CanvasSide, width: number, color: string }>;
    private currentSide: CanvasSide;
    private previousClickedDotIndex?: DotIndex;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config);

        this.inputCanvas = inputCanvas;
        this.dotsUtility = new DotsUtility();

        this.threads = [];
        this.currentSide = CanvasSide.Back;

        this.subscribe();
    }

    public override dispose(): void {
        this.threads = [];
        super.dispose();
    }

    protected override redraw(): void {
        this.redrawThreads();
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const moveUn = this.inputCanvas.onMove(this.handleMove.bind(this));
        super.registerUn(moveUn);

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

    private handlePointerUp(event: PointerUpEvent): void {
        const position = event.position;
        this.handleDotClick(position);
    }

    private handleDotClick(position: Position): void {
        const closestDotIndex = super.getDotIndex(position);
        const currentlyClickedDot = !closestDotIndex ? undefined : super.getDotPositionByIndex(closestDotIndex);

        if (!currentlyClickedDot) {
            return;
        }

        const previousClickedDot = !this.previousClickedDotIndex ? undefined : this.getDotPositionByIndex(this.previousClickedDotIndex);
        if (currentlyClickedDot.x === previousClickedDot?.x &&
            currentlyClickedDot.y === previousClickedDot?.y
        ) {
            return;
        }

        if (previousClickedDot !== undefined) {
            const threadIndex = { from: this.previousClickedDotIndex!, to: closestDotIndex!, side: this.currentSide, width: this._threadWidth, color: this._threadColor };
            const thread = { from: previousClickedDot, to: currentlyClickedDot, side: this.currentSide, width: this._threadWidth, color: this._threadColor };
            this.threads.push(threadIndex);
            this.drawThread(thread);
        }

        this.previousClickedDotIndex = closestDotIndex;
        this.changeSide();
    }

    private redrawThreads(): void {
        const frontThreadsIndexes = this.threads.filter((thread) => thread.side === CanvasSide.Front);

        const threads: Array<StitchThread> = [];

        frontThreadsIndexes.forEach((threadIndex) => {
            const from = super.getDotPositionByIndex(threadIndex.from)!;
            const to = super.getDotPositionByIndex(threadIndex.to)!;

            const recreated = { from, to, side: threadIndex.side, width: this._threadWidth, color: this._threadColor };
            threads.push(recreated);
        });

        super.invokeDrawThreads(threads, this._dotRadius);
    }

    private drawThread(thread: StitchThread): void {
        if (thread.side == CanvasSide.Front) {
            super.invokeDrawThreads([thread], this._dotRadius);
        }
    }

    private changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }
}