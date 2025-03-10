import { CanvasBase } from "../base.js";
import { IInputCanvas, Position } from "../input/types.js";
import { Bounds, BoundsIndexes, CanvasConfig, DotIndex } from "../types.js";

export abstract class VirtualCanvasDimensions extends CanvasBase {
    protected readonly config: Readonly<CanvasConfig>;
    protected readonly inputCanvas: IInputCanvas;

    protected dotRadius: number;
    protected dotsSpacing: number;
    protected threadWidth: number;

    protected _virtualBounds: Bounds;
    protected _movingBounds?: Bounds;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super();

        this.config = config;
        this.inputCanvas = inputCanvas;

        this.dotRadius = config.dot.radius.value;
        this.dotsSpacing = config.dotSpacing.value / 2;

        this.threadWidth = config.thread.width.value;

        this._virtualBounds = { left: 0, top: 0, width: 0, height: 0 };
    }

    protected get allDotsY(): number {
        const invisibleRows = this.config.rows - 1;
        const all = this.config.rows + invisibleRows;
        return all;
    }

    protected get allDotsX(): number {
        const invisibleColumns = this.config.columns - 1;
        const all = this.config.columns + invisibleColumns;
        return all;
    }

    protected get inMovingMode(): boolean {
        return this._movingBounds !== undefined;
    }

    protected get visibleBounds(): Bounds {
        return this.inputCanvas.bounds;
    }

    protected get virtualBounds(): Bounds {
        return this._virtualBounds;
    }

    protected set virtualBounds(bounds: Bounds) {
        const hasChange =
            (this._virtualBounds.left !== bounds.left) ||
            (this._virtualBounds.top !== bounds.top) ||
            (this._virtualBounds.width !== bounds.width) ||
            (this._virtualBounds.height !== bounds.height);

        if (hasChange) {
            this._virtualBounds = bounds;
        }
    }

    protected inVirtualBounds(position: Position): boolean {
        const dotIdx = this.calculateDotIndex(position);
        const dotPos = this.calculateDotPosition(dotIdx);

        const inVirtualX = (dotPos.x >= this.virtualBounds.left) && (dotPos.x <= (this.virtualBounds.left + this.virtualBounds.width));
        const inVirtualY = (dotPos.y >= this.virtualBounds.top) && (dotPos.y <= (this.virtualBounds.top + this.virtualBounds.height));

        const inVirtualBounds = (inVirtualX && inVirtualY);
        return inVirtualBounds;
    }

    protected canMoveTo(position: Position): boolean {
        const inVirtualBounds = this.inVirtualBounds(position);
        return inVirtualBounds;
    }

    protected startMove(currentPosition: Position, previousPosition: Position): void {
        const diffX = (currentPosition.x - previousPosition.x);
        const diffY = (currentPosition.y - previousPosition.y);

        this.virtualBounds = this.calculateVirtualBounds(diffX, diffY);
        this.bounds = this.calculateDrawingBounds();

        const movingBounds = this.calculateMovingBounds(currentPosition);
        this._movingBounds = this.bounds = movingBounds;
    }

    protected move(currentPosition: Position, previousPosition: Position): void {
        const diffX = currentPosition.x - previousPosition.x;
        const diffY = currentPosition.y - previousPosition.y;

        this.virtualBounds = this.calculateVirtualBounds(diffX, diffY);
        this.bounds = { left: this.bounds.left + diffX, top: this.bounds.top + diffY, width: this.bounds.width, height: this.bounds.height };
    }

    protected stopMove(): void {
        this._movingBounds = undefined;
    }

    protected recalculateBounds(): void {
        //TODO: change the name of the method since not all bounds are recalculated!!!
        this.virtualBounds = this.calculateVirtualBounds(0, 0);
        this.bounds = this.calculateDrawingBounds();
    }

    protected calculateDotPosition(dotIndex: DotIndex): Position {
        const x = this.calculateDotXPosition(dotIndex.dotX);
        const y = this.calculateDotYPosition(dotIndex.dotY);
        return { x, y };
    }

    protected calculateDotXPosition(dotX: number): number {
        const x = this.virtualBounds.left + (dotX * this.dotsSpacing);
        return x;
    }

    protected calculateDotYPosition(dotY: number): number {
        const y = this.virtualBounds.top + (dotY * this.dotsSpacing);
        return y;
    }

    protected calculateDotIndex(position: Position): DotIndex {
        const closestX = (position.x - this.virtualBounds.left) / this.dotsSpacing;
        const closestY = (position.y - this.virtualBounds.top) / this.dotsSpacing;

        const indexX = Math.round(closestX);
        const indexY = Math.round(closestY);

        return { dotX: indexX, dotY: indexY };
    }

    protected calculateBoundsIndexes(): BoundsIndexes {
        const leftTopPos = this.calculateLeftTopPosition();
        const leftTopIdx = this.calculateDotIndex(leftTopPos);

        const width = this.calculateWidth();
        const rightTop = { x: (leftTopPos.x + width), y: leftTopPos.y };
        const rightTopIndex = this.calculateDotIndex(rightTop);

        const height = this.calculateHeight();
        const leftBottom = { x: leftTopPos.x, y: (leftTopPos.y + height) };
        const leftBottomIdx = this.calculateDotIndex(leftBottom);

        const rightBottom = { x: (leftTopPos.x + width), y: leftTopPos.y + height };
        const rightBottomIdx = this.calculateDotIndex(rightBottom);

        const boundsIndexes = {
            leftTop: leftTopIdx,
            rightTop: rightTopIndex,
            leftBottom: leftBottomIdx,
            rightBottom: rightBottomIdx
        };

        return boundsIndexes;
    }

    protected calculateVirtualBounds(differenceX: number, differenceY: number): Bounds {
        const left = (this.virtualBounds.left + differenceX);
        const top = (this.virtualBounds.top + differenceY);

        const width = (this.allDotsX - 1) * this.dotsSpacing;
        const height = (this.allDotsY - 1) * this.dotsSpacing;

        return { left, top, width, height };
    }

    protected calculateDrawingBounds(): Bounds {
        const leftTopPos = this.calculateLeftTopPosition();
        const width = this.calculateWidth();
        const height = this.calculateHeight();

        const bounds = {
            left: leftTopPos.x,
            top: leftTopPos.y,
            width,
            height
        };

        return bounds;
    }

    protected calculateMovingBounds(position: Position): Bounds {
        const moveDownSpace = (this.visibleBounds.height - position.y);
        const moveUpSpace = (this.visibleBounds.height - moveDownSpace);
        const moveRightSpace = (this.visibleBounds.width - position.x);
        const moveLeftSpace = (this.visibleBounds.width - moveRightSpace);

        const suggestedTop = (-1 * moveDownSpace);
        const top = Math.max(suggestedTop, this.virtualBounds.top);
        const topDiff = (Math.abs(this.virtualBounds.top) - Math.abs(top));

        const suggestedHeight = ((-1 * top) + (this.bounds.top + this.bounds.height + moveUpSpace));
        const height = Math.min(suggestedHeight, (this.virtualBounds.height - topDiff));

        const suggestedLeft = (-1 * moveRightSpace);
        const left = Math.max(suggestedLeft, this.virtualBounds.left);
        const leftDiff = (Math.abs(this.virtualBounds.left) - Math.abs(left));

        const suggestedWidth = ((-1 * left) + (this.bounds.left + this.bounds.width + moveLeftSpace));
        const width = Math.min(suggestedWidth, (this.virtualBounds.width - leftDiff));

        const movingBounds = { left, top, width, height };
        return movingBounds;
    }

    protected calculateLeftTopPosition(): Position {
        const drawingBounds = this.inMovingMode ? this._movingBounds! : this.visibleBounds;

        const visibleLeftTopX = this.virtualBounds.left < drawingBounds.left
            ? drawingBounds.left
            : Math.min(this.virtualBounds.left, (drawingBounds.left + drawingBounds.width));

        const visibleLeftTopY = this.virtualBounds.top < drawingBounds.top
            ? drawingBounds.top
            : Math.min(this.virtualBounds.top, (drawingBounds.top + drawingBounds.height));

        const visibleLeftTopDot = { x: visibleLeftTopX, y: visibleLeftTopY };
        return visibleLeftTopDot;
    }

    protected calculateWidth(): number {
        const drawingBounds = this.inMovingMode ? this._movingBounds! : this.visibleBounds;

        if (this.virtualBounds.left < drawingBounds.left) {
            const virtualWidth = (this.virtualBounds.width - (Math.abs(this.virtualBounds.left) - Math.abs(drawingBounds.left)));
            return Math.min(virtualWidth, drawingBounds.width);
        }

        if (this.virtualBounds.left > drawingBounds.left) {
            const visibleWidthOffset = (drawingBounds.left + drawingBounds.width);
            const virtualWidthOffset = (this.virtualBounds.left + this.virtualBounds.width);

            if (virtualWidthOffset <= visibleWidthOffset) {
                return this.virtualBounds.width;
            } else {
                return (drawingBounds.width - this.virtualBounds.left);
            }
        }

        return Math.min(this.virtualBounds.width, drawingBounds.width);
    }

    protected calculateHeight(): number {
        const drawingBounds = this.inMovingMode ? this._movingBounds! : this.visibleBounds;

        if (this.virtualBounds.top < drawingBounds.top) {
            const virtualHeight = (this.virtualBounds.height - (Math.abs(this.virtualBounds.top) - Math.abs(drawingBounds.top)));
            return Math.min(virtualHeight, drawingBounds.height);
        }

        if (this.virtualBounds.top > drawingBounds.top) {
            const visibleHeightOffset = (drawingBounds.top + drawingBounds.height);
            const virtualHeightOffset = (this.virtualBounds.top + this.virtualBounds.height);

            if (virtualHeightOffset <= visibleHeightOffset) {
                return this.virtualBounds.height;
            } else {
                return (drawingBounds.height - this.virtualBounds.top);
            }
        }

        return Math.min(this.virtualBounds.height, drawingBounds.height);
    }

    protected zoomInSpacing(): void {
        const configSpacing = this.config.dotSpacing;
        const spacing = (this.dotsSpacing < configSpacing.value)
            ? (this.dotsSpacing + this.config.dotSpacing.zoomOutStep)
            : (this.dotsSpacing + this.config.dotSpacing.zoomInStep);

        this.dotsSpacing = spacing;
    }

    protected zoomOutSpacing(): void {
        const configSpacing = this.config.dotSpacing;
        const spacing = this.dotsSpacing > configSpacing.value
            ? (this.dotsSpacing - this.config.dotSpacing.zoomInStep)
            : (this.dotsSpacing - this.config.dotSpacing.zoomOutStep);

        this.dotsSpacing = spacing;
    }

    protected zoomInDots(): void {
        const configDotRadius = this.config.dot.radius;
        this.dotRadius += this.dotRadius < configDotRadius.value
            ? configDotRadius.zoomOutStep
            : configDotRadius.zoomInStep;
    }

    protected zoomOutDots(): void {
        const configDotRadius = this.config.dot.radius;
        this.dotRadius -= this.dotRadius > configDotRadius.value
            ? configDotRadius.zoomInStep
            : configDotRadius.zoomOutStep;
    }

    protected zoomInThreads(): void {
        const configThreadWidth = this.config.thread.width;
        this.threadWidth += this.threadWidth < configThreadWidth.value
            ? configThreadWidth.zoomOutStep
            : configThreadWidth.zoomInStep;
    }

    protected zoomOutThreads(): void {
        const configThreadWidth = this.config.thread.width;
        this.threadWidth -= this.threadWidth > configThreadWidth.value
            ? configThreadWidth.zoomInStep
            : configThreadWidth.zoomOutStep;
    }
}