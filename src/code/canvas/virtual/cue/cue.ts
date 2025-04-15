import { CueCanvasBase } from "./base.js";
import assert from "../../../asserts/assert.js";
import { DotsUtility } from "../../utilities/dots.js";
import { IdGenerator } from "../../utilities/generator.js";
import { CueCanvasConfig } from "../../../config/types.js";
import { CueThread } from "../../utilities/arrays/thread/cue.js";
import { CanvasSide, Id, CueSegment, CueDot, Dot, DotIndex, CuePattern } from "../../types.js";
import { Position, IInputCanvas, PointerUpEvent, PointerMoveEvent } from "../../input/types.js";

export abstract class CueCanvas extends CueCanvasBase {
    private readonly ids: IdGenerator;
    private readonly dotsUtility: DotsUtility<Dot>;
    private readonly pattern: CuePattern;

    private dotColor: string;
    private dotRadius: number;
    private readonly minDotRadius: number;
    private readonly dotRadiusZoomStep: number;

    protected threadColor: string;
    protected threadWidth: number;
    private readonly minThreadWidth: number;
    private readonly threadWidthZoomStep: number;

    private zooms: number;
    private currentSegmentId?: Id;
    private clickedDotIdx?: DotIndex;
    private hoveredDotIdx?: DotIndex & { id: Id };

    constructor(config: CueCanvasConfig, input: IInputCanvas) {
        super(config, input);

        this.validateConfig(config);

        const dotConfig = config.dot;
        const threadConfig = config.thread;

        this.dotColor = dotConfig.color;
        this.dotRadius = dotConfig.radius;
        this.minDotRadius = dotConfig.minRadius;
        this.dotRadiusZoomStep = dotConfig.radiusZoomStep;

        this.threadColor = threadConfig.color;
        this.threadWidth = threadConfig.width;
        this.minThreadWidth = threadConfig.minWidth;
        this.threadWidthZoomStep = threadConfig.widthZoomStep;

        this.ids = new IdGenerator();
        this.dotsUtility = new DotsUtility();
        this.pattern = new Array<CueThread>();

        this.zooms = 0;

        this.createThread(this.threadColor, this.threadWidth);

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

    protected createThread(color: string, width: number): void {
        const thread = new CueThread(color, width);
        this.pattern.push(thread);
    }

    private getCurrentThread(): CueThread | undefined {
        const length = this.pattern.length;
        const array = this.pattern.slice(length - 1, length);
        
        return array.length === 0 ? undefined : array[0];
    }

    protected cutThread(): void {
        this.clickedDotIdx = undefined;
        this.currentSide = CanvasSide.Back;
    }

    private redrawWhileMoving(): void {
        this.removeSegment();

        const dotIdx = this.clickedDotIdx ?? this.hoveredDotIdx;
        if (dotIdx) {
            const dotPos = this.calculateDotPosition(dotIdx);
            this.moveDot(dotPos);
        }
    }

    private redrawWhileNotMoving(): void {
        // 1. remove hovered dot and segment
        const hoveredDotIdx = this.hoveredDotIdx;
        this.hoveredDotIdx = undefined;
        this.currentSegmentId = undefined;

        // 2. recreate hovered dot and segment
        if (hoveredDotIdx) {
            const dotPos = this.calculateDotPosition(hoveredDotIdx);

            const inBounds = super.inBounds(dotPos);
            if (inBounds) {
                const event = { position: dotPos };
                this.handlePointerMove(event);
            }
        }
    }

    private handlePointerMove(event: PointerMoveEvent): void {
        super.ensureAlive();

        const position = event.position;
        assert.positive(position.x, "position.x");
        assert.positive(position.y, "position.y");

        const inBounds = this.inBounds(position);
        if (inBounds) {
            this.moveDot(position);
            this.resizeThead(position);
        }
    }

    private handlePointerUp(event: PointerUpEvent): void {
        super.ensureAlive();

        const position = event.position;
        assert.positive(position.x, "position.x");
        assert.positive(position.y, "position.y");

        const inBounds = this.inBounds(position);
        if (inBounds) {
            this.clickDot(position);
            this.removeSegment();
        }
    }

    private handleUndo(): void {
        super.ensureAlive();

        // let last = this.cueDots.last();
        // if (last?.threadColor !== this.threadColor && last?.threadWidth !== this.threadWidth) {
        //     this.changeCanvasSide();
        // } else {
        //     this.cueDots.pop();
        //     last = this.cueDots.last();
        // }

        // if (!last) {
        //     this.cutThread();
        //     this.removeThread();

        //     const config = this.config as CueCanvasConfig;
        //     this.threadColor = config.thread.color;
        //     this.invokeThreadColorChange(this.threadColor);

        //     this.threadWidth = config.thread.width;
        //     this.invokeThreadWidthChange(this.threadWidth);

        //     if (this.hoveredDotIdx) {
        //         const dotPos = this.calculateDotPosition(this.hoveredDotIdx);
        //         this.moveDot(dotPos);
        //     }
        // } else {
        //     this.removeThread();
        //     this.changeCanvasSide();

        //     this.threadColor = last.threadColor;
        //     this.invokeThreadColorChange(this.threadColor);

        //     this.threadWidth = last.threadWidth;
        //     this.invokeThreadWidthChange(this.threadWidth);

        //     this.clickedDotIdx = last.clickedDotIdx;

        //     if (this.hoveredDotIdx) {
        //         const dotPos = this.calculateDotPosition(this.hoveredDotIdx);
        //         const event = { position: dotPos };
        //         this.handlePointerMove(event);
        //     }
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

            const currentThread = this.getCurrentThread();
            assert.defined(currentThread, "currentThread");

            currentThread.pushDotIndex(clickedDotIdx.dotX, clickedDotIdx.dotY);

        } else {
            const previouslyClickedDotPos = this.calculateDotPosition(previouslyClickedDotIdx);
            const areIdenticalClicks = this.dotsUtility.areDotsEqual(clickedDotPos, previouslyClickedDotPos);

            if (!areIdenticalClicks) {
                this.changeSide(clickedDotPos, clickedDotIdx);

                const currentThread = this.getCurrentThread();
                assert.defined(currentThread, "currentThread");

                currentThread.pushDotIndex(clickedDotIdx.dotX, clickedDotIdx.dotY);
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

            let segment: CueSegment;
            if (this.currentSegmentId) {
                const segmentId = this.currentSegmentId;
                segment = this.createSegment(segmentId, previouslyClickedDotPos, clickedDotPos);
                super.invokeMoveSegment(segment);
            } else {
                const segmentId = this.ids.next();
                segment = this.createSegment(segmentId, previouslyClickedDotPos, clickedDotPos);
                this.drawSegment(segment);
            }
            this.currentSegmentId = segment.id;
        }
    }

    private drawSegment(segment: CueSegment): void {
        if (this.currentSide === CanvasSide.Front) {
            super.invokeDrawSegment(segment);
        } else {
            super.invokeDrawDashSegment(segment);
        }
    }

    private removeHoveredDot(): void {
        if (this.hoveredDotIdx) {
            const dotId = this.hoveredDotIdx.id;
            super.invokeRemoveDot(dotId);
            this.hoveredDotIdx = undefined;
        }
    }

    private removeSegment(): void {
        if (this.currentSegmentId) {
            super.invokeRemoveSegment(this.currentSegmentId);
            this.currentSegmentId = undefined;
        }
    }

    private createSegment(id: number, previouslyClickedDotPos: Position, clickedDotPos: Position): CueSegment {
        const color = this.threadColor;
        const width = this.calculateZoomedThreadWidth(this.threadWidth);

        const segment = { id, from: previouslyClickedDotPos, to: clickedDotPos, width, color };
        return segment;
    }

    private calculateZoomedThreadWidth(threadWidth: number): number {
        let calculated = threadWidth + (this.zooms * this.threadWidthZoomStep);
        calculated = Math.max(calculated, this.minThreadWidth);
        return calculated;
    }

    private startListening(): void {
        const pointerMoveUn = this.inputCanvas.onPointerMove(this.handlePointerMove.bind(this));
        super.registerUn(pointerMoveUn);

        const pointerUpUn = this.inputCanvas.onPointerUp(this.handlePointerUp.bind(this));
        super.registerUn(pointerUpUn);

        const undoUn = this.inputCanvas.onUndo(this.handleUndo.bind(this));
        super.registerUn(undoUn);
    }

    private validateConfig(config: CueCanvasConfig): void {
        const dotConfig = config.dot;
        assert.defined(dotConfig, "DotConfig");

        const threadConfig = config.thread;
        assert.defined(threadConfig, "ThreadConfig");

        assert.greaterThanZero(dotConfig.radius, "dotRadius");
        assert.greaterThanZero(dotConfig.minRadius, "minDotRadius");
        assert.greaterThanZero(dotConfig.radiusZoomStep, "dotRadiusZoomStep");
        assert.greaterThanZero(dotConfig.color.length, "dotColor.length");

        assert.greaterThanZero(threadConfig.width, "threadWidth");
        assert.greaterThanZero(threadConfig.minWidth, "minThreadWidth");
        assert.greaterThanZero(threadConfig.widthZoomStep, "threadWidthZoomStep");
        assert.greaterThanZero(threadConfig.color.length, "threadColor.length");
    }
}