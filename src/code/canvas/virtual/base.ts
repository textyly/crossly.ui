import { CanvasBase } from "../base.js";
import { Messaging2, Messaging3 } from "../../messaging/impl.js";
import { DotIndex, IVirtualCanvas } from "./types.js";
import { IMessaging2, IMessaging3 } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import { Bounds, CanvasSide, CanvasConfig, BoundsChangeEvent } from "../types.js";
import { IInputCanvas, MoveEvent, MoveListener, Position } from "../input/types.js";

export abstract class VirtualCanvasBase extends CanvasBase {
    protected readonly inputCanvas: IInputCanvas;
    protected readonly config: Readonly<CanvasConfig>;

    private virtualLeft = 0;
    private virtualTop = 0;
    private virtualWidth = 0;
    private virtualHeight = 0;

    protected dotsSpacing: number;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super();

        this.inputCanvas = inputCanvas;
        this.config = config;
        this.bounds = this.inputCanvas.bounds;
        this.dotsSpacing = config.dotSpacing.value / 2;
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

    protected get visibleBounds(): Bounds {
        return this.inputCanvas.bounds;
    }

    protected get drawingBounds(): Bounds {
        return this.bounds;
    }

    protected get virtualBounds(): Bounds {
        const bounds = {
            left: this.virtualLeft,
            top: this.virtualTop,
            width: this.virtualWidth,
            height: this.virtualHeight
        };
        return bounds;
    }

    private set virtualBounds(value: Bounds) {
        const hasChange = (this.virtualLeft !== value.left) || (this.virtualTop !== value.top) || (this.virtualWidth !== value.width) || (this.virtualHeight !== value.height);
        if (hasChange) {
            this.virtualLeft = value.left;
            this.virtualTop = value.top;
            this.virtualWidth = value.width;
            this.virtualHeight = value.height;
        }
    }

    protected calculateBounds(differenceX: number = 0, differenceY: number = 0): void {
        this.virtualBounds = this.calculateVirtualBounds(differenceX, differenceY);
        this.bounds = this.calculateDrawingBounds();

        // console.log(`visible bounds: ${JSON.stringify(this.visibleBounds)}`);
        // console.log(`drawing bounds: ${JSON.stringify(this.drawingBounds)}`);
        // console.log(`virtual bounds: ${JSON.stringify(this.virtualBounds)}`);
    }

    private calculateVirtualBounds(differenceX: number, differenceY: number): Bounds {
        const left = this.virtualBounds.left + differenceX;
        const top = this.virtualBounds.top + differenceY;

        const width = (this.allDotsX - 1) * this.dotsSpacing;
        const height = (this.allDotsY - 1) * this.dotsSpacing;

        return { left, top, width, height };
    }

    private calculateDrawingBounds(): Bounds {
        const visibleLeftTop = this.calculateDrawingLeftTop();
        const visibleWidth = this.calculateDrawingWidth();
        const visibleHeight = this.calculateDrawingHeight();

        const drawingBounds = {
            left: visibleLeftTop.x,
            top: visibleLeftTop.y,
            width: visibleWidth,
            height: visibleHeight
        };

        return drawingBounds;
    }

    protected calculateDrawingIndex(position: Position): DotIndex {
        // TODO:
        const closestX = (position.x - this.virtualBounds.left) / this.dotsSpacing;
        const closestY = (position.y - this.virtualBounds.top) / this.dotsSpacing;

        const indexX = Math.round(closestX);
        const indexY = Math.round(closestY);

        return { indexX, indexY };
    }

    protected calculateVirtualIndex(position: Position): DotIndex {
        const closestX = (position.x - this.virtualBounds.left) / this.dotsSpacing;
        const closestY = (position.y - this.virtualBounds.top) / this.dotsSpacing;

        const indexX = Math.round(closestX);
        const indexY = Math.round(closestY);

        return { indexX, indexY };
    }

    protected calculateDrawingPosition(index: DotIndex): Position {
        const x = this.calculateDrawingX(index.indexX)
        const y = this.calculateDrawingY(index.indexY)
        return { x, y };
    }

    protected calculateDrawingX(indexX: number): number {
        // TODO:
        const x = this.virtualBounds.left + (indexX * this.dotsSpacing);
        return x;
    }

    protected calculateDrawingY(indexY: number): number {
        // TODO:
        const y = this.virtualBounds.top + (indexY * this.dotsSpacing);
        return y;
    }

    protected calculateVirtualPosition(index: DotIndex): Position {
        const x = this.calculateVirtualX(index.indexX)
        const y = this.calculateVirtualY(index.indexY)
        return { x, y };
    }

    protected calculateVirtualX(indexX: number): number {
        const x = this.virtualBounds.left + (indexX * this.dotsSpacing);
        return x;
    }

    protected calculateVirtualY(indexY: number): number {
        const y = this.virtualBounds.top + (indexY * this.dotsSpacing);
        return y;
    }

    protected calculateDrawingLeftTopIndex(): DotIndex {
        const visibleLeftTop = this.calculateDrawingLeftTop();
        const visibleLeftTopIndex = this.calculateDrawingIndex(visibleLeftTop);
        return visibleLeftTopIndex;
    }

    protected calculateDrawingLeftTop(): Position {
        const virtualBounds = this.virtualBounds;
        const visibleBounds = this.visibleBounds;

        const visibleLeftTopX = virtualBounds.left < visibleBounds.left
            ? visibleBounds.left
            : Math.min(virtualBounds.left, (visibleBounds.left + visibleBounds.width));

        const visibleLeftTopY = virtualBounds.top < visibleBounds.top
            ? visibleBounds.top
            : Math.min(virtualBounds.top, (visibleBounds.top + visibleBounds.height));

        const visibleLeftTopDot = { x: visibleLeftTopX, y: visibleLeftTopY };
        return visibleLeftTopDot;
    }

    protected calculateDrawingWidth(): number {
        const virtualBounds = this.virtualBounds;
        const visibleBounds = this.visibleBounds;

        if (virtualBounds.left < visibleBounds.left) {
            const virtualWidth = virtualBounds.width - (Math.abs(virtualBounds.left) + Math.abs(visibleBounds.left));
            return Math.min(virtualWidth, visibleBounds.width);
        } else {
            const visibleWidthOffset = visibleBounds.left + visibleBounds.width;
            const virtualWidthOffset = virtualBounds.left + virtualBounds.width;

            if (virtualWidthOffset <= visibleWidthOffset) {
                return virtualBounds.width;
            } else {
                return (visibleBounds.width - virtualBounds.left);
            }
        }
    }

    protected calculateDrawingHeight(): number {
        const virtualBounds = this.virtualBounds;
        const visibleBounds = this.visibleBounds;

        if (virtualBounds.top < visibleBounds.top) {
            const virtualHeight = virtualBounds.height - (Math.abs(virtualBounds.top) + Math.abs(visibleBounds.top));
            return Math.min(virtualHeight, visibleBounds.height);
        } else {
            const visibleHeightOffset = visibleBounds.top + visibleBounds.height;
            const virtualHeightOffset = virtualBounds.top + virtualBounds.height;

            if (virtualHeightOffset <= visibleHeightOffset) {
                return virtualBounds.height;
            } else {
                return (visibleBounds.height - virtualBounds.top);
            }
        }
    }

    protected inDrawingBounds(position: Position): boolean {
        // TODO: 

        const dotIndex = this.calculateVirtualIndex(position);
        const calculatedX = this.virtualBounds.left + (dotIndex.indexX * this.dotsSpacing);
        const calculatedY = this.virtualBounds.top + (dotIndex.indexY * this.dotsSpacing);

        const virtualBounds = this.virtualBounds;

        const inVirtualX = (calculatedX >= virtualBounds.left) && (calculatedX <= virtualBounds.left + virtualBounds.width);
        const inVirtualY = (calculatedY >= virtualBounds.top) && (calculatedY <= virtualBounds.top + virtualBounds.height);

        const isInVirtualBounds = inVirtualX && inVirtualY;

        return isInVirtualBounds;
    }
}