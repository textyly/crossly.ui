import { CueCanvasBase } from "./base.js";
import { DotsUtility } from "../../utilities/dots.js";
import { IdGenerator } from "../../utilities/generator.js";
import { Position, IInputCanvas, PointerUpEvent, PointerMoveEvent } from "../../input/types.js";
import { CanvasSide, Id, CueThread, CueDot, Dot, DotIndex, CueCanvasConfig } from "../../types.js";

export abstract class CueCanvas extends CueCanvasBase {
    private readonly ids: IdGenerator;
    private readonly dotsUtility: DotsUtility<Dot>;

    private dotRadius: number;
    private dotColor: string;
    private dotRadiusZoomStep: number;

    protected threadWidth: number;
    protected threadColor: string;
    private threadWidthZoomStep: number;

    private currentThreadId?: Id;
    private clickedDotIndex?: DotIndex;
    private hoveredDotIndex?: DotIndex & { id: Id };

    constructor(config: CueCanvasConfig, input: IInputCanvas) {
        super(config, input);

        this.ids = new IdGenerator();
        this.dotsUtility = new DotsUtility();

        const dotConfig = config.dot;
        this.dotColor = dotConfig.color;
        this.dotRadius = dotConfig.radius;
        this.dotRadiusZoomStep = dotConfig.radiusZoomStep;

        const threadConfig = config.thread;
        this.threadColor = threadConfig.color;
        this.threadWidth = threadConfig.width;
        this.threadWidthZoomStep = threadConfig.widthZoomStep;

        this.startListening();
    }

    protected override zoomIn(): void {
        this.dotRadius += this.dotRadiusZoomStep;
        this.threadWidth += this.threadWidthZoomStep;
    }

    protected override zoomOut(): void {
        this.dotRadius -= this.dotRadiusZoomStep;
        this.threadWidth -= this.threadWidthZoomStep;
    }

    protected override redraw(): void {
        if (this.inMovingMode) {
            this.removeHoveredDot();
            this.removeThread();
        } else {
            // 1. remove hovered dot and thread
            const dotIndex = this.hoveredDotIndex;
            this.hoveredDotIndex = undefined;
            this.currentThreadId = undefined;

            // 2. recreate hovered dot and thread
            if (dotIndex) {
                const dotPos = this.calculateDotPosition(dotIndex);
                const event = { position: dotPos };
                this.handlePointerMove(event);
            }
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
        const inVirtualBounds = this.inVirtualBounds(position);

        if (inVirtualBounds) {
            this.moveDot(position);
            this.resizeThead(position);
        }
    }

    private handlePointerUp(event: PointerUpEvent): void {
        const position = event.position;
        const inVirtualBounds = this.inVirtualBounds(position);

        if (inVirtualBounds) {
            const position = event.position;
            this.clickDot(position);
            this.removeThread();
        }
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
        const previouslyClickedDotIndex = this.clickedDotIndex;

        if (!previouslyClickedDotIndex) {
            // TODO: move in a method
            this.changeSide();
            this.removeHoveredDot();
            this.hoverDot(clickedDotPos, clickedDotIdx);

        } else {
            const previouslyClickedDotPos = this.calculateDotPosition(previouslyClickedDotIndex);
            const areIdenticalClicks = this.dotsUtility.areDotsEqual(clickedDotPos, previouslyClickedDotPos);

            if (!areIdenticalClicks) {
                this.changeSide();
                this.removeHoveredDot();
                this.hoverDot(clickedDotPos, clickedDotIdx);
            }
        }

        this.clickedDotIndex = clickedDotIdx;
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
            const fromDotPos = this.calculateDotPosition(this.clickedDotIndex);

            let thread: CueThread;
            if (this.currentThreadId) {
                const threadId = this.currentThreadId;
                thread = this.createThread(fromDotPos, toPosition, threadId);
                super.invokeMoveThread(thread);
            } else {
                const threadId = this.ids.next();
                thread = this.createThread(fromDotPos, toPosition, threadId);
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