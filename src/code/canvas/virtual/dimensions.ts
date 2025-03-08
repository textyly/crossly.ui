import { DotIndex } from "./types.js";
import { CanvasBase } from "../base.js";
import { IInputCanvas, Position } from "../input/types.js";
import { Bounds, BoundsIndexes, CanvasConfig } from "../types.js";

export class VirtualCanvasDimensions extends CanvasBase {
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

    protected inVirtualBounds(virtualBounds: Bounds, position: Position, dotsSpacing: number): boolean {
        const dotIndex = this.calculateDrawingIndex(virtualBounds, position, dotsSpacing);
        const drawingPosition = this.calculateDrawingPosition(virtualBounds, dotIndex, dotsSpacing);

        const inVirtualX = (drawingPosition.x >= virtualBounds.left) && (drawingPosition.x <= virtualBounds.left + virtualBounds.width);
        const inVirtualY = (drawingPosition.y >= virtualBounds.top) && (drawingPosition.y <= virtualBounds.top + virtualBounds.height);

        const inVirtualBounds = inVirtualX && inVirtualY;
        return inVirtualBounds;
    }

    protected canMoveTo(position: Position): boolean {
        const inVirtualBounds = this.inVirtualBounds(this.virtualBounds, position, this.dotsSpacing);
        return inVirtualBounds;
    }

    protected startMove(currentPosition: Position, previousPosition: Position): void {
        const diffX = currentPosition.x - previousPosition.x;
        const diffY = currentPosition.y - previousPosition.y;

        this.virtualBounds = this.calculateVirtualBounds(this.virtualBounds, this.allDotsX, this.allDotsY, this.dotsSpacing, diffX, diffY);
        this.bounds = this.calculateDrawingBounds(this.virtualBounds, this.visibleBounds);

        const movingBounds = this.calculateMovingBounds(currentPosition, this.bounds, this.visibleBounds, this.virtualBounds);
        this._movingBounds = this.bounds = movingBounds;
    }

    protected move(currentPosition: Position, previousPosition: Position): void {
        const diffX = currentPosition.x - previousPosition.x;
        const diffY = currentPosition.y - previousPosition.y;

        this.virtualBounds = this.calculateVirtualBounds(this.virtualBounds, this.allDotsX, this.allDotsY, this.dotsSpacing, diffX, diffY);

        const bounds = this.bounds;
        this.bounds = { left: bounds.left + diffX, top: bounds.top + diffY, width: bounds.width, height: bounds.height };
    }

    protected stopMove(): void {
        this._movingBounds = undefined;
    }

    protected recalculateBounds(): void {
        this.virtualBounds = this.calculateVirtualBounds(this.virtualBounds, this.allDotsX, this.allDotsY, this.dotsSpacing, 0, 0);
        this.bounds = this.calculateDrawingBounds(this.virtualBounds, this.visibleBounds);
    }

    protected calculateDrawingPosition(virtualBounds: Bounds, index: DotIndex, dotsSpacing: number): Position {
        const x = this.calculateDrawingX(virtualBounds, index.dotX, dotsSpacing);
        const y = this.calculateDrawingY(virtualBounds, index.dotY, dotsSpacing);
        return { x, y };
    }

    protected calculateDrawingX(virtualBounds: Bounds, indexX: number, dotsSpacing: number): number {
        const x = virtualBounds.left + (indexX * dotsSpacing);
        return x;
    }

    protected calculateDrawingY(virtualBounds: Bounds, indexY: number, dotsSpacing: number): number {
        const y = virtualBounds.top + (indexY * dotsSpacing);
        return y;
    }

    protected calculateDrawingIndex(virtualBounds: Bounds, position: Position, dotsSpacing: number): DotIndex {
        const closestX = (position.x - virtualBounds.left) / dotsSpacing;
        const closestY = (position.y - virtualBounds.top) / dotsSpacing;

        const indexX = Math.round(closestX);
        const indexY = Math.round(closestY);

        return { dotX: indexX, dotY: indexY };
    }

    protected calculateDrawingBoundsIndexes(virtualBounds: Bounds, visibleBounds: Bounds, dotsSpacing: number): BoundsIndexes {
        const leftTop = this.calculateDrawingLeftTop(virtualBounds, visibleBounds);
        const leftTopIndex = this.calculateDrawingIndex(virtualBounds, leftTop, dotsSpacing);

        const width = this.calculateDrawingWidth(virtualBounds, visibleBounds);
        const rightTop = { x: leftTop.x + width, y: leftTop.y };
        const rightTopIndex = this.calculateDrawingIndex(virtualBounds, rightTop, dotsSpacing);

        const height = this.calculateDrawingHeight(virtualBounds, visibleBounds);
        const leftBottom = { x: leftTop.x, y: leftTop.y + height };
        const leftBottomIndex = this.calculateDrawingIndex(virtualBounds, leftBottom, dotsSpacing);

        const rightBottom = { x: leftTop.x + width, y: leftTop.y + height };
        const rightBottomIndex = this.calculateDrawingIndex(virtualBounds, rightBottom, dotsSpacing);

        const boundsIndexes = {
            leftTop: leftTopIndex,
            rightTop: rightTopIndex,
            leftBottom: leftBottomIndex,
            rightBottom: rightBottomIndex
        };

        return boundsIndexes;
    }

    protected calculateVirtualBounds(virtualBounds: Bounds, allDotsX: number, allDotsY: number, dotsSpacing: number, differenceX: number, differenceY: number): Bounds {
        const left = virtualBounds.left + differenceX;
        const top = virtualBounds.top + differenceY;

        const width = (allDotsX - 1) * dotsSpacing;
        const height = (allDotsY - 1) * dotsSpacing;

        return { left, top, width, height };
    }

    protected calculateDrawingBounds(virtualBounds: Bounds, visibleBounds: Bounds): Bounds {
        const drawingLeftTop = this.calculateDrawingLeftTop(virtualBounds, visibleBounds);
        const drawingWidth = this.calculateDrawingWidth(virtualBounds, visibleBounds);
        const drawingHeight = this.calculateDrawingHeight(virtualBounds, visibleBounds);

        const drawingBounds = {
            left: drawingLeftTop.x,
            top: drawingLeftTop.y,
            width: drawingWidth,
            height: drawingHeight
        };

        return drawingBounds;
    }

    protected calculateMovingBounds(currentPosition: Position, bounds: Bounds, visibleBounds: Bounds, virtualBounds: Bounds): Bounds {
        const moveDownSpace = visibleBounds.height - currentPosition.y;
        const moveUpSpace = visibleBounds.height - moveDownSpace;
        const moveRightSpace = visibleBounds.width - currentPosition.x;
        const moveLeftSpace = visibleBounds.width - moveRightSpace;

        const suggestedTop = -1 * moveDownSpace;
        const top = Math.max(suggestedTop, virtualBounds.top);
        const topDiff = Math.abs(virtualBounds.top) - Math.abs(top);

        const suggestedHeight = -1 * top + (bounds.top + bounds.height + moveUpSpace);
        const height = Math.min(suggestedHeight, virtualBounds.height - topDiff);

        const suggestedLeft = -1 * moveRightSpace;
        const left = Math.max(suggestedLeft, virtualBounds.left);
        const leftDiff = Math.abs(virtualBounds.left) - Math.abs(left);

        const suggestedWidth = -1 * left + (bounds.left + bounds.width + moveLeftSpace);
        const width = Math.min(suggestedWidth, virtualBounds.width - leftDiff);

        const movingBounds = { left, top, width, height };
        return movingBounds;
    }

    protected calculateDrawingLeftTop(virtualBounds: Bounds, visibleBounds: Bounds): Position {
        const visibleLeftTopX = virtualBounds.left < visibleBounds.left
            ? visibleBounds.left
            : Math.min(virtualBounds.left, (visibleBounds.left + visibleBounds.width));

        const visibleLeftTopY = virtualBounds.top < visibleBounds.top
            ? visibleBounds.top
            : Math.min(virtualBounds.top, (visibleBounds.top + visibleBounds.height));

        const visibleLeftTopDot = { x: visibleLeftTopX, y: visibleLeftTopY };
        return visibleLeftTopDot;
    }

    protected calculateDrawingWidth(virtualBounds: Bounds, visibleBounds: Bounds): number {
        if (virtualBounds.left < visibleBounds.left) {
            const virtualWidth = virtualBounds.width - (Math.abs(virtualBounds.left) - Math.abs(visibleBounds.left));
            return Math.min(virtualWidth, visibleBounds.width);
        }

        if (virtualBounds.left > visibleBounds.left) {
            const visibleWidthOffset = visibleBounds.left + visibleBounds.width;
            const virtualWidthOffset = virtualBounds.left + virtualBounds.width;

            if (virtualWidthOffset <= visibleWidthOffset) {
                return virtualBounds.width;
            } else {
                return (visibleBounds.width - virtualBounds.left);
            }
        }

        return Math.min(virtualBounds.width, visibleBounds.width);
    }

    protected calculateDrawingHeight(virtualBounds: Bounds, visibleBounds: Bounds): number {
        if (virtualBounds.top < visibleBounds.top) {
            const virtualHeight = virtualBounds.height - (Math.abs(virtualBounds.top) - Math.abs(visibleBounds.top));
            return Math.min(virtualHeight, visibleBounds.height);
        }

        if (virtualBounds.top > visibleBounds.top) {
            const visibleHeightOffset = visibleBounds.top + visibleBounds.height;
            const virtualHeightOffset = virtualBounds.top + virtualBounds.height;

            if (virtualHeightOffset <= visibleHeightOffset) {
                return virtualBounds.height;
            } else {
                return (visibleBounds.height - virtualBounds.top);
            }
        }

        return Math.min(virtualBounds.height, visibleBounds.height);
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
        const spacing = (this.dotsSpacing > configSpacing.value)
            ? (this.dotsSpacing - this.config.dotSpacing.zoomInStep)
            : (this.dotsSpacing - this.config.dotSpacing.zoomOutStep);

        this.dotsSpacing = spacing;
    }

    protected zoomInDots(): void {
        const configDotRadius = this.config.dot.radius;
        this.dotRadius += (this.dotRadius < configDotRadius.value)
            ? configDotRadius.zoomOutStep
            : configDotRadius.zoomInStep;
    }

    protected zoomOutDots(): void {
        const configDotRadius = this.config.dot.radius;
        this.dotRadius -= (this.dotRadius > configDotRadius.value)
            ? configDotRadius.zoomInStep
            : configDotRadius.zoomOutStep;
    }

    protected zoomInThreads(): void {
        const configThreadWidth = this.config.thread.width;
        this.threadWidth += (this.threadWidth < configThreadWidth.value)
            ? configThreadWidth.zoomOutStep
            : configThreadWidth.zoomInStep;
    }

    protected zoomOutThreads(): void {
        const configThreadWidth = this.config.thread.width;
        this.threadWidth -= (this.threadWidth > configThreadWidth.value)
            ? configThreadWidth.zoomInStep
            : configThreadWidth.zoomOutStep;
    }
}