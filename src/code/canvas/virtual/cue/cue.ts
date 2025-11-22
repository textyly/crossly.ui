import { CueCanvasBase } from "./base.js";
import assert from "../../../asserts/assert.js";
import { DotsUtility } from "../../utilities/dots.js";
import { IdGenerator } from "../../utilities/generator.js";
import { CueCanvasConfig } from "../../../config/types.js";
import patternCloning from "../../utilities/arrays/cloning.js";
import { ICueThreadPath } from "../../utilities/arrays/types.js";
import { CueThreadPath } from "../../utilities/arrays/thread/cue.js";
import { Position, IInputCanvas, PointerUpEvent, PointerMoveEvent } from "../../input/types.js";
import { CanvasSide, Id, CueSegment, CueDot, Dot, DotIndex, StitchPattern } from "../../types.js";

// TODO: there is common logic between CueCanvas and StitchCanvas, and therefore:
// 1. when features are added code must be duplicated with some small differences
// 2. bug fixes must be present in both classes
// Common logic must be extracted in a base class
// This can be done once a good amount of unit/integration tests are written
export abstract class CueCanvas extends CueCanvasBase {
    private readonly ids: IdGenerator;
    private readonly dotsUtility: DotsUtility<Dot>;
    protected _pattern: Array<CueThreadPath>;
    protected _redoPattern: Array<ICueThreadPath> | undefined;

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

        this.dotRadius = dotConfig.radius;
        this.minDotRadius = dotConfig.minRadius;
        this.dotRadiusZoomStep = dotConfig.radiusZoomStep;

        this._pattern = new Array<CueThreadPath>();
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


    protected override zoomInCore(): void {
        super.ensureAlive();
        this.zooms += 1;
    }

    protected override zoomOutCore(): void {
        super.ensureAlive();
        this.zooms -= 1;
    }

    protected override redraw(): void {
        if (this.inMovingMode) {
            this.redrawWhileMoving();
        } else {
            this.redrawWhileNotMoving();
        }
    }

    protected loadPattern(columns: number, rows: number, pattern: StitchPattern): void {
        this._columns = columns;
        this._rows = rows;
        this._pattern = new Array<CueThreadPath>;
        this._redoPattern = undefined;
        let lastDotIdx: DotIndex | undefined = undefined;

        pattern.forEach((threadPath) => {
            this.useNewThread("", threadPath.color, threadPath.width);

            const thread = this.getCurrentThread();
            for (let index = 0; index < threadPath.length; index++) {
                const indexX = threadPath.indexesX[index];
                const indexY = threadPath.indexesY[index];
                thread.pushDotIndex(indexX, indexY);

                this.changeCanvasSide();
                lastDotIdx = { dotX: indexX, dotY: indexY };
            }
        });

        this.clickedDotIdx = lastDotIdx;
    }

    protected createThread(color: string, width: number): void {
        const thread = new CueThreadPath(color, width);
        this._pattern.push(thread);
    }

    protected useNewThread(name: string, color: string, width: number): void {
        this.clickedDotIdx = undefined;
        this.currentSide = CanvasSide.Back;
        this._redoPattern = undefined;

        this.createThread(color, width);
        this.draw();
    }

    protected getCurrentThread(): CueThreadPath {
        const length = this._pattern.length;
        const array = this._pattern.slice(length - 1, length);

        const thread = array.length === 0 ? undefined : array[0];
        assert.defined(thread, "thread");

        return thread;
    }

    protected undoClickDot(): void {
        super.ensureAlive();

        const threadsCount = this._pattern.length;
        assert.greaterThanZero(threadsCount, "threadsCount");

        const currentThread = this.getCurrentThread();
        assert.defined(currentThread, "currentThread");

        this.undoClickDotCore();
        this.draw();
    }

    protected redoClickDot(): void {
        const threadsCount = this._pattern.length;
        assert.greaterThanZero(threadsCount, "threadsCount");

        const currentThread = this.getCurrentThread();
        assert.defined(currentThread, "currentThread");

        if (this._redoPattern) {
            const errorMsg = "redo pattern cannot have less thread paths than the current one (on which undo operations have been performed)";
            assert.that(this._pattern.length <= this._redoPattern.length, errorMsg);

            this.redoClickDotCore(this._pattern, this._redoPattern);

            this.draw();
        }
    }

    protected clickDotIndex(dotIdx: DotIndex): void {
        const clickedDotPos = this.calculateDotPosition(dotIdx);
        const previouslyClickedDotIdx = this.clickedDotIdx;

        if (!previouslyClickedDotIdx) {
            this.changeSide(clickedDotPos, dotIdx);

            const currentThread = this.getCurrentThread();

            currentThread.pushDotIndex(dotIdx.dotX, dotIdx.dotY);
            this._redoPattern = undefined;

        } else {
            const previouslyClickedDotPos = this.calculateDotPosition(previouslyClickedDotIdx);
            const areIdenticalClicks = this.dotsUtility.areDotsEqual(clickedDotPos, previouslyClickedDotPos);

            if (!areIdenticalClicks) {
                this.changeSide(clickedDotPos, dotIdx);

                const currentThread = this.getCurrentThread();

                currentThread.pushDotIndex(dotIdx.dotX, dotIdx.dotY);
                this._redoPattern = undefined;
            }
        }

        this.clickedDotIdx = dotIdx;
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
            this.clickDotPosition(position);
            this.removeSegment();
        }
    }

    private handleRedo(): void {
        super.ensureAlive();
        this.redoClickDot();
    }

    private handleUndo(): void {
        super.ensureAlive();
        this.undoClickDot();
    }

    private undoClickDotCore(): void {
        const currentThread = this.getCurrentThread();
        this._redoPattern = this._redoPattern ?? patternCloning.cloneCuePattern(this._pattern);

        const currentThreadDots = currentThread.length;

        if (currentThreadDots > 0) {
            // thread has crossed at least one hole
            if (currentThreadDots === 1) {
                // remove last dot
                currentThread.popDotIndex();

                this.clickedDotIdx = undefined;
                this.currentSide = CanvasSide.Back;
            } else {
                currentThread.popDotIndex();
                this.changeCanvasSide();

                const lastDotIdx = currentThread.lastDotIndex()!;
                this.clickedDotIdx = lastDotIdx;

                if (this.hoveredDotIdx) {
                    const dotPos = this.calculateDotPosition(this.clickedDotIdx);
                    const event = { position: dotPos };
                    this.handlePointerMove(event);
                }
            }
        } else {
            const threads = this._pattern.length;
            if (threads > 1) {
                // remove current thread
                this._pattern.pop();
                const previousThread = this.getCurrentThread();

                if (previousThread.length > 0) {
                    const lastDotIdx = previousThread.lastDotIndex()!;
                    this.clickedDotIdx = lastDotIdx;
                    this.currentSide = previousThread.length % 2 === 0 ? CanvasSide.Back : CanvasSide.Front;

                    if (this.hoveredDotIdx) {
                        const dotPos = this.calculateDotPosition(this.clickedDotIdx);
                        const event = { position: dotPos };
                        this.handlePointerMove(event);
                    }
                }
            }
        }
    }

    private redoClickDotCore(currentPattern: Array<CueThreadPath>, redoPattern: Array<ICueThreadPath>): void {
        const currentThreadPathIndex = currentPattern.length - 1;
        const redoThreadPath = redoPattern[currentThreadPathIndex];
        const currentThreadPath = currentPattern[currentThreadPathIndex];

        if (redoThreadPath.length > currentThreadPath.length) {
            const redoDotIndex = currentThreadPath.length;
            const indexX = redoThreadPath.indexesX[redoDotIndex];
            const indexY = redoThreadPath.indexesY[redoDotIndex];
            currentThreadPath.pushDotIndex(indexX, indexY);

            this.clickedDotIdx = { dotX: indexX, dotY: indexY };
            this.changeCanvasSide();

        } else if (redoPattern.length > currentPattern.length) {
            const nextRedoThreadPath = redoPattern[currentPattern.length];
            const newCurrentThreadPath = new CueThreadPath(nextRedoThreadPath.color, nextRedoThreadPath.width);
            currentPattern.push(newCurrentThreadPath);

            this.clickedDotIdx = undefined;
            this.currentSide = CanvasSide.Back;
        }

        if (this.hoveredDotIdx && this.clickedDotIdx) {
            const dotPos = this.calculateDotPosition(this.clickedDotIdx);
            const event = { position: dotPos };
            this.handlePointerMove(event);
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

    private clickDotPosition(position: Position): void {
        const dotIdx = this.calculateDotIndex(position);
        this.clickDotIndex(dotIdx);
    }

    private changeSide(clickedDotPos: Position, clickedDotIdx: DotIndex): void {
        this.changeCanvasSide();
        this.removeHoveredDot();
        this.hoverDot(clickedDotPos, clickedDotIdx);
    }

    private hoverDot(dot: Dot, dotIndex: DotIndex): void {
        const id = this.ids.next();
        const hoveredDot: CueDot = { id, ...dot };

        const thread = this.getCurrentThread();
        const dotColor = thread.color;

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

        const redoUn = this.inputCanvas.onRedo(this.handleRedo.bind(this));
        super.registerUn(redoUn);
    }

    private validateConfig(config: CueCanvasConfig): void {
        const dotConfig = config.dots;
        assert.greaterThanZero(dotConfig.radius, "dotRadius");
        assert.greaterThanZero(dotConfig.minRadius, "minDotRadius");
        assert.greaterThanZero(dotConfig.radiusZoomStep, "dotRadiusZoomStep");

        const threadConfig = config.threads;
        assert.greaterThanZero(threadConfig.width, "threadWidth");
        assert.greaterThanZero(threadConfig.minWidth, "minThreadWidth");
        assert.greaterThanZero(threadConfig.widthZoomStep, "threadWidthZoomStep");
        assert.greaterThanZero(threadConfig.color.length, "threadColor.length");
    }
}