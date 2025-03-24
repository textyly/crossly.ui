import { CueCanvasBase } from "./base.js";
import { DotsUtility } from "../../utilities/dots.js";
import { IdGenerator } from "../../utilities/generator.js";
import { CueCanvasConfig } from "../../../config/types.js";
import { StitchThreadArray } from "../../utilities/arrays/thread/stitch.js";
import { CanvasSide, Id, CueThread, CueDot, Dot, DotIndex } from "../../types.js";
import { Position, IInputCanvas, PointerUpEvent, PointerMoveEvent } from "../../input/types.js";

export abstract class CueCanvas extends CueCanvasBase {
    private readonly ids: IdGenerator;
    private readonly dotsUtility: DotsUtility<Dot>;

    private dotColor: string;
    private dotRadius: number;
    private minDotRadius: number;
    private dotRadiusZoomStep: number;
    private zooms: number;

    protected threadColor: string;
    protected threadWidth: number;
    private minThreadWidth: number;
    private threadWidthZoomStep: number;

    private currentThreadId?: Id;
    private clickedDotIdx?: DotIndex;
    private hoveredDotIdx?: DotIndex & { id: Id };

    constructor(config: CueCanvasConfig, input: IInputCanvas) {
        super(config, input);

        this.ids = new IdGenerator();
        this.dotsUtility = new DotsUtility();

        const dotConfig = config.dot;
        this.dotColor = dotConfig.color;
        this.dotRadius = dotConfig.radius;
        this.minDotRadius = dotConfig.minRadius;
        this.dotRadiusZoomStep = dotConfig.radiusZoomStep;

        const threadConfig = config.thread;
        this.threadColor = threadConfig.color;
        this.threadWidth = threadConfig.width;
        this.minThreadWidth = threadConfig.minWidth;
        this.threadWidthZoomStep = threadConfig.widthZoomStep;

        this.zooms = 0;

        this.startListening();
    }

    protected override zoomIn(): void {
        this.zooms += 1;
    }

    protected override zoomOut(): void {
        this.zooms -= 1;
    }

    protected override redraw(): void {
        if (this.inMovingMode) {
            this.redrawWhileMoving();
        } else {
            this.redrawWhileNotMoving();
        }
    }

    private redrawWhileMoving(): void {
        this.removeThread();

        const dotIdx = this.clickedDotIdx ?? this.hoveredDotIdx;
        if (dotIdx) {
            const dotPos = this.calculateDotPosition(dotIdx);
            this.moveDot(dotPos);
        }
    }

    private redrawWhileNotMoving(): void {
        // 1. remove hovered dot and thread
        const hoveredDotIdx = this.hoveredDotIdx;
        this.hoveredDotIdx = undefined;
        this.currentThreadId = undefined;

        // 2. recreate hovered dot and thread
        if (hoveredDotIdx) {
            const dotPos = this.calculateDotPosition(hoveredDotIdx);
            const event = { position: dotPos };
            this.handlePointerMove(event);
        }
    }

    private startListening(): void {
        const pointerMoveUn = this.inputCanvas.onPointerMove(this.handlePointerMove.bind(this));
        super.registerUn(pointerMoveUn);

        const pointerUpUn = this.inputCanvas.onPointerUp(this.handlePointerUp.bind(this));
        super.registerUn(pointerUpUn);

        const undoUn = this.inputCanvas.onUndo(this.handleUndo.bind(this));
        super.registerUn(undoUn);
    }

    private handlePointerMove(event: PointerMoveEvent): void {
        const position = event.position;
        const inBounds = this.inBounds(position);

        if (inBounds) {
            this.moveDot(position);
            this.resizeThead(position);
        }
    }

    private handlePointerUp(event: PointerUpEvent): void {
        const position = event.position;
        const inBounds = this.inBounds(position);

        if (inBounds) {
            const position = event.position;
            this.clickDot(position);
            this.removeThread();
        }
    }

    private handleUndo(): void {
        // const stitchThread = this.threads.popThread();
        // if (stitchThread) {
        //     this.removeThread();
        //     this.removeHoveredDot();
        //     this.changeCanvasSide();

        //     this.clickedDotIdx = { dotX: stitchThread.fromDotXIdx, dotY: stitchThread.fromDotYIdx };

        //     this.threadColor = stitchThread.color;
        //     this.invokeThreadColorChange(this.threadColor);

        //     this.threadWidth = stitchThread.width;
        //     this.invokeThreadWidthChange(this.threadWidth);


        //     this.draw();
        // }
    }

    private moveDot(position: Position): void {
        // 1. remove previously hovered dot
        this.removeHoveredDot();

        // 2. get a newly hovered dot's position
        const dotIdx = this.calculateDotIndex(position);
        const dotPos = this.calculateDotPosition(dotIdx);

        // 3. hover the new dot
        this.hoverDot(dotPos, dotIdx);
    }

    private clickDot(position: Position): void {
        const clickedDotIdx = this.calculateDotIndex(position);
        const clickedDotPos = this.calculateDotPosition(clickedDotIdx);
        const previouslyClickedDotIdx = this.clickedDotIdx;

        if (!previouslyClickedDotIdx) {
            this.changeSide(clickedDotPos, clickedDotIdx);

        } else {
            const previouslyClickedDotPos = this.calculateDotPosition(previouslyClickedDotIdx);
            const areIdenticalClicks = this.dotsUtility.areDotsEqual(clickedDotPos, previouslyClickedDotPos);

            if (!areIdenticalClicks) {
                this.changeSide(clickedDotPos, clickedDotIdx);
            }
        }

        this.clickedDotIdx = clickedDotIdx;
    }

    private changeSide(clickedDotPos: Position, clickedDotIdx: DotIndex): void {
        this.changeCanvasSide();
        this.removeHoveredDot();
        this.hoverDot(clickedDotPos, clickedDotIdx);
    }

    private hoverDot(dot: Dot, dotIndex: DotIndex): void {
        const id = this.ids.next();
        const hoveredDot: CueDot = { id, ...dot };

        const dotColor = this.dotColor;

        let dotRadius = this.dotRadius + (this.zooms * this.dotRadiusZoomStep);
        dotRadius = Math.max(dotRadius, this.minDotRadius);

        this.currentSide === CanvasSide.Back
            ? super.invokeDrawDashDot(hoveredDot, dotRadius, dotColor)
            : super.invokeDrawDot(hoveredDot, dotRadius, dotColor);


        this.hoveredDotIdx = { id, ...dotIndex };
    }

    private resizeThead(toPosition: Position): void {
        const previouslyClickedDotIdx = this.clickedDotIdx;
        if (previouslyClickedDotIdx) {
            const previouslyClickedDotPos = this.calculateDotPosition(previouslyClickedDotIdx);
            const clickedDotIdx = this.calculateDotIndex(toPosition);
            const clickedDotPos = this.calculateDotPosition(clickedDotIdx);

            let thread: CueThread;
            if (this.currentThreadId) {
                const threadId = this.currentThreadId;
                thread = this.createThread(threadId, previouslyClickedDotPos, clickedDotPos);
                super.invokeMoveThread(thread);
            } else {
                const threadId = this.ids.next();
                thread = this.createThread(threadId, previouslyClickedDotPos, clickedDotPos);
                this.drawThread(thread);
            }
            this.currentThreadId = thread.id;
        }
    }

    private drawThread(thread: CueThread): void {
        if (this.currentSide === CanvasSide.Front) {
            super.invokeDrawThread(thread);
        } else {
            super.invokeDrawDashThread(thread);
        }
    }

    private removeHoveredDot(): void {
        if (this.hoveredDotIdx) {
            const dotId = this.hoveredDotIdx.id;
            super.invokeRemoveDot(dotId);
            this.hoveredDotIdx = undefined;
        }
    }

    private removeThread(): void {
        if (this.currentThreadId) {
            super.invokeRemoveThread(this.currentThreadId);
            this.currentThreadId = undefined;
        }
    }

    private createThread(id: number, previouslyClickedDotPos: Position, clickedDotPos: Position): CueThread {
        const color = this.threadColor;
        const width = this.calculateZoomedThreadWidth(this.threadWidth);

        const thread = { id, from: previouslyClickedDotPos, to: clickedDotPos, width, color };
        return thread;
    }

    private calculateZoomedThreadWidth(threadWidth: number): number {
        let calculated = threadWidth + (this.zooms * this.threadWidthZoomStep);
        calculated = Math.max(calculated, this.minThreadWidth);
        return calculated;
    }
}