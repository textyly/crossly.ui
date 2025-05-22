import { CueCanvasBase } from "./base.js";
import assert from "../../../asserts/assert.js";
import { DotsUtility } from "../../utilities/dots.js";
import { IdGenerator } from "../../utilities/generator.js";
import { CueCanvasConfig } from "../../../config/types.js";
import { CueThreadArray } from "../../utilities/arrays/thread/cue.js";
import { CanvasSide, Id, CueSegment, CueDot, Dot, DotIndex } from "../../types.js";
import { Position, IInputCanvas, PointerUpEvent, PointerMoveEvent } from "../../input/types.js";

export abstract class CueCanvas extends CueCanvasBase {
    private readonly ids: IdGenerator;
    private readonly dotsUtility: DotsUtility<Dot>;
    protected _pattern: Array<CueThreadArray>;

    private dotColor: string;
    private dotRadius: number;
    private readonly minDotRadius: number;
    private readonly dotRadiusZoomStep: number;

    private readonly minThreadWidth: number;
    private readonly threadWidthZoomStep: number;

    private zooms: number;
    private currentSegmentId?: Id;
    protected clickedDotIdx?: DotIndex;
    private hoveredDotIdx?: DotIndex & { id: Id };

    constructor(className: string, config: CueCanvasConfig, input: IInputCanvas) {
        super(className, config, input);

        this.validateConfig(config);

        const dotConfig = config.dots;
        const threadConfig = config.threads;

        this.dotColor = dotConfig.color;
        this.dotRadius = dotConfig.radius;
        this.minDotRadius = dotConfig.minRadius;
        this.dotRadiusZoomStep = dotConfig.radiusZoomStep;

        this._pattern = new Array<CueThreadArray>();
        this.createThread(threadConfig.color, threadConfig.width);

        this.minThreadWidth = threadConfig.minWidth;
        this.threadWidthZoomStep = threadConfig.widthZoomStep;

        this.ids = new IdGenerator();
        this.dotsUtility = new DotsUtility();

        this.zooms = 0;

        this.startListening();
    }

    public override dispose(): void {
        super.ensureAlive();

        this._pattern.forEach((threadArray) => threadArray.clear());
        this._pattern = [];

        super.dispose();
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
        const thread = new CueThreadArray(color, width);
        this._pattern.push(thread);
    }

    protected useNewThread(name: string, color: string, width: number): void {
        this.removeThread();
        this.createThread(color, width);
        this.draw();
    }

    protected getCurrentThread(): CueThreadArray | undefined {
        const length = this._pattern.length;
        const array = this._pattern.slice(length - 1, length);

        return array.length === 0 ? undefined : array[0];
    }

    protected removeThread(): void {
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

        const threadsCount = this._pattern.length;
        assert.greaterThanZero(threadsCount, "threadsCount");

        const currentThread = this.getCurrentThread();
        assert.defined(currentThread, "currentThread");

        const dotsCount = currentThread.length;
        if (dotsCount === 0) {
            // thread is just created without crossing any hole (state immediately following `use new thread` operation)
            if (threadsCount === 1) {
                // there is only 1 thread which has not crossed any hole
                // cannot undo any more
            } else {
                // remove current thread
                this._pattern.pop();

                const previousThread = this.getCurrentThread();
                assert.defined(previousThread, "previousThread");

                const previousThreadDotsCount = previousThread.length;
                if (previousThreadDotsCount === 0) {
                    // previous thread have not crossed any dots as well, just remove it
                } else {
                    this.currentSide = previousThreadDotsCount % 2 === 0 ? CanvasSide.Back : CanvasSide.Front;

                    const lastDotIdx = previousThread.lastDotIndex()!;
                    this.clickedDotIdx = lastDotIdx;

                    if (this.hoveredDotIdx) {
                        const dotPos = this.calculateDotPosition(this.hoveredDotIdx);
                        const event = { position: dotPos };
                        this.handlePointerMove(event);
                    }
                }
            }
        } else {
            // thread has crossed at leas one hole
            if (dotsCount === 1) {
                // remove last dot
                currentThread.popDotIndex();
                this.removeThread();
            } else {
                // remove last dot
                currentThread.popDotIndex();
                this.changeCanvasSide();

                const lastDotIdx = currentThread.lastDotIndex()!;
                this.clickedDotIdx = lastDotIdx;

                if (this.hoveredDotIdx) {
                    const dotPos = this.calculateDotPosition(this.hoveredDotIdx);
                    const event = { position: dotPos };
                    this.handlePointerMove(event);
                }
            }
        }

        this.draw();
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
        const currentThread = this.getCurrentThread();
        assert.defined(currentThread, "currentThread");

        const color = currentThread.color;
        const width = this.calculateZoomedThreadWidth(currentThread.width);

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
        const dotConfig = config.dots;
        assert.greaterThanZero(dotConfig.radius, "dotRadius");
        assert.greaterThanZero(dotConfig.minRadius, "minDotRadius");
        assert.greaterThanZero(dotConfig.radiusZoomStep, "dotRadiusZoomStep");
        assert.greaterThanZero(dotConfig.color.length, "dotColor.length");

        const threadConfig = config.threads;
        assert.greaterThanZero(threadConfig.width, "threadWidth");
        assert.greaterThanZero(threadConfig.minWidth, "minThreadWidth");
        assert.greaterThanZero(threadConfig.widthZoomStep, "threadWidthZoomStep");
        assert.greaterThanZero(threadConfig.color.length, "threadColor.length");
    }
}