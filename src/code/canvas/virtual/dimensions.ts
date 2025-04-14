import { CanvasBase } from "../base.js";
import { CanvasConfig } from "../../config/types.js";
import { IInputCanvas, Position } from "../input/types.js";
import { Bounds, BoundsIndexes, DotIndex } from "../types.js";
import assert from "../../asserts/assert.js";

export abstract class VirtualCanvasDimensions extends CanvasBase {
    protected readonly config: Readonly<CanvasConfig>;
    protected readonly inputCanvas: IInputCanvas;

    protected dotsSpace: number;
    protected currentDotsSpace: number;
    protected minDotsSpace: number;

    protected _virtualBounds: Bounds;
    protected movingBounds?: Bounds;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super();

        this.config = config;
        assert.defined(this.config, "config");

        this.inputCanvas = inputCanvas;
        assert.defined(this.inputCanvas, "inputCanvas");

        const dotsSpacing = config.dotsSpacing;
        assert.greaterThanZero(dotsSpacing.space, "space");
        assert.greaterThanZero(dotsSpacing.minSpace, "minSpace");

        this.currentDotsSpace = this.dotsSpace = dotsSpacing.space / 2;
        this.minDotsSpace = dotsSpacing.minSpace / 2;

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
        return this.movingBounds !== undefined;
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

    protected inBounds(position: Position): boolean {
        const inDrawingBounds = this.inDrawingBounds(position);
        return inDrawingBounds;
    }

    protected zoomInCanvas(position: Position): void {
        const oldDotIdx = this.calculateDotIndex(position);
        const oldDotSpace = this.currentDotsSpace;

        const spaceZoomStep = this.config.dotsSpacing.spaceZoomStep / 2;
        this.currentDotsSpace += spaceZoomStep;

        const diffX = (oldDotSpace - this.currentDotsSpace) * oldDotIdx.dotX;
        const diffY = (oldDotSpace - this.currentDotsSpace) * oldDotIdx.dotY;
        this.recalculateBounds(diffX, diffY);
    }

    protected zoomOutCanvas(position: Position): void {
        const oldDotIdx = this.calculateDotIndex(position);
        const oldDotSpace = this.currentDotsSpace;

        const spaceZoomStep = this.config.dotsSpacing.spaceZoomStep / 2;
        this.currentDotsSpace -= spaceZoomStep;

        const diffX = (oldDotSpace - this.currentDotsSpace) * oldDotIdx.dotX;
        const diffY = (oldDotSpace - this.currentDotsSpace) * oldDotIdx.dotY;
        this.recalculateBounds(diffX, diffY);
    }

    protected startMove(currentPosition: Position, previousPosition: Position): void {
        const diffX = (currentPosition.x - previousPosition.x);
        const diffY = (currentPosition.y - previousPosition.y);
        this.recalculateBounds(diffX, diffY);

        const movingBounds = this.calculateMovingBounds(currentPosition);
        this.movingBounds = this.bounds = movingBounds;
    }

    protected move(currentPosition: Position, previousPosition: Position): void {
        const diffX = currentPosition.x - previousPosition.x;
        const diffY = currentPosition.y - previousPosition.y;
        this.virtualBounds = this.calculateVirtualBounds(diffX, diffY);

        const left = this.bounds.left + diffX;
        const top = this.bounds.top + diffY;
        const width = this.bounds.width;
        const height = this.bounds.height;
        this.bounds = { left, top, width, height };
    }

    protected stopMove(): void {
        this.movingBounds = undefined;
    }

    protected recalculateBounds(diffX: number = 0, diffY: number = 0): void {
        this.virtualBounds = this.calculateVirtualBounds(diffX, diffY);
        this.bounds = this.calculateDrawingBounds();
    }

    protected calculateDotPosition(dotIndex: DotIndex): Position {
        const x = this.calculateDotXPosition(dotIndex.dotX);
        const y = this.calculateDotYPosition(dotIndex.dotY);
        return { x, y };
    }

    protected calculateDotXPosition(dotX: number): number {
        const x = this.virtualBounds.left + (dotX * this.currentDotsSpace);
        return x;
    }

    protected calculateDotYPosition(dotY: number): number {
        const y = this.virtualBounds.top + (dotY * this.currentDotsSpace);
        return y;
    }

    protected calculateDotIndex(position: Position): DotIndex {
        const closestX = (position.x - this.virtualBounds.left) / this.currentDotsSpace;
        const closestY = (position.y - this.virtualBounds.top) / this.currentDotsSpace;

        const indexX = Math.round(closestX);
        const indexY = Math.round(closestY);

        return { dotX: indexX, dotY: indexY };
    }

    protected calculateVisibleBoundsIndexes(): BoundsIndexes {
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

    private calculateVirtualBounds(diffX: number, diffY: number): Bounds {
        const left = (this.virtualBounds.left + diffX);
        const top = (this.virtualBounds.top + diffY);

        const width = (this.allDotsX - 1) * this.currentDotsSpace;
        const height = (this.allDotsY - 1) * this.currentDotsSpace;

        return { left, top, width, height };
    }

    private calculateDrawingBounds(): Bounds {
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

    private calculateMovingBounds(position: Position): Bounds {
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

    private calculateLeftTopPosition(): Position {
        const drawingBounds = this.inMovingMode ? this.movingBounds! : this.visibleBounds;

        const visibleLeftTopX = this.virtualBounds.left < drawingBounds.left
            ? drawingBounds.left
            : Math.min(this.virtualBounds.left, (drawingBounds.left + drawingBounds.width));

        const visibleLeftTopY = this.virtualBounds.top < drawingBounds.top
            ? drawingBounds.top
            : Math.min(this.virtualBounds.top, (drawingBounds.top + drawingBounds.height));

        const visibleLeftTopDot = { x: visibleLeftTopX, y: visibleLeftTopY };
        return visibleLeftTopDot;
    }

    private calculateWidth(): number {
        const drawingBounds = this.inMovingMode ? this.movingBounds! : this.visibleBounds;

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

    private calculateHeight(): number {
        const drawingBounds = this.inMovingMode ? this.movingBounds! : this.visibleBounds;

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

    private inDrawingBounds(position: Position): boolean {
        const dotIdx = this.calculateDotIndex(position);
        const dotPos = this.calculateDotPosition(dotIdx);
        const drawingBounds = this.calculateDrawingBounds();

        const inDrawingX = (dotPos.x >= drawingBounds.left) && (dotPos.x <= (drawingBounds.left + drawingBounds.width));
        const inDrawingY = (dotPos.y >= drawingBounds.top) && (dotPos.y <= (drawingBounds.top + drawingBounds.height));

        const inDrawingBounds = (inDrawingX && inDrawingY);
        return inDrawingBounds;
    }
}