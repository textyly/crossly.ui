import { CanvasBase } from "../base.js";
import { Messaging2, Messaging3 } from "../../messaging/impl.js";
import { DotIndex, IVirtualCanvas } from "./types.js";
import { IMessaging2, IMessaging3 } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import { Bounds, CanvasSide, CanvasConfig, BoundsChangeEvent } from "../types.js";
import { IInputCanvas, MoveEvent, MoveListener, Position } from "../input/types.js";

// TODO: create VirtualCanvas abstract class and extract part of the logic
export abstract class VirtualCanvasBase extends CanvasBase implements IVirtualCanvas {
    private readonly config: Readonly<CanvasConfig>;
    private readonly virtualMessaging: IMessaging2<void, void>;
    protected readonly inputCanvas: IInputCanvas;

    private virtualLeft = 0;
    private virtualTop = 0;
    private virtualWidth = 0;
    private virtualHeight = 0;

    protected dotsSpacing: number;
    protected dotColor: string;
    protected dotRadius: number;

    protected threadColor: string;
    protected threadWidth: number;

    protected currentSide: CanvasSide;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super();

        this.bounds = inputCanvas.bounds;

        this.inputCanvas = inputCanvas;
        this.config = config;

        this.virtualMessaging = new Messaging2();
        this.currentSide = CanvasSide.Back;

        this.dotsSpacing = config.dotSpacing.value / 2;

        const dotConfig = config.dot;
        this.dotColor = dotConfig.color;
        this.dotRadius = dotConfig.radius.value;

        const threadConfig = config.thread;
        this.threadColor = threadConfig.color;
        this.threadWidth = threadConfig.width.value;

        this.subscribe();
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

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.virtualMessaging.listenOnChannel0(listener);
    }

    public onMoveStart(listener: VoidListener): VoidUnsubscribe {
        return this.virtualMessaging.listenOnChannel1(listener);
    }

    public onMoveStop(listener: VoidListener): VoidUnsubscribe {
        return this.virtualMessaging.listenOnChannel2(listener);
    }

    public override dispose(): void {
        this.virtualMessaging.dispose();
        super.dispose();
    }

    public draw(): void {
        this.invokeRedraw();
        this.calculateBounds();
        this.redraw();
    }

    protected abstract redraw(): void;

    private calculateBounds(differenceX: number = 0, differenceY: number = 0): void {
        this.calculateVirtualBounds(differenceX, differenceY);
        this.calculateDrawingBounds();

        console.log(`visible bounds: ${JSON.stringify(this.visibleBounds)}`);
        console.log(`drawing bounds: ${JSON.stringify(this.drawingBounds)}`);
        console.log(`virtual bounds: ${JSON.stringify(this.virtualBounds)}`);
    }

    private calculateVirtualBounds(differenceX: number, differenceY: number): void {
        const left = this.virtualBounds.left + differenceX;
        const top = this.virtualBounds.top + differenceY;

        const width = (this.allDotsX - 1) * this.dotsSpacing;
        const height = (this.allDotsY - 1) * this.dotsSpacing;

        this.virtualBounds = { left, top, width, height };
    }

    private calculateDrawingBounds(): void {
        const visibleLeftTop = this.calculateVisibleLeftTop();
        const visibleWidth = this.calculateVisibleWidth();
        const visibleHeight = this.calculateVisibleHeight();

        const drawingBounds = {
            left: visibleLeftTop.x,
            top: visibleLeftTop.y,
            width: visibleWidth,
            height: visibleHeight
        };

        this.bounds = drawingBounds;
    }

    protected calculateDotIndex(position: Position): DotIndex {
        const closestX = (position.x - this.virtualBounds.left) / this.dotsSpacing;
        const closestY = (position.y - this.virtualBounds.top) / this.dotsSpacing;

        const indexX = Math.round(closestX);
        const indexY = Math.round(closestY);

        return { indexX, indexY };
    }

    protected calculateDot(index: DotIndex): Position {
        const x = this.calculateDotX(index.indexX)
        const y = this.calculateDotY(index.indexY)
        return { x, y };
    }

    protected calculateDotX(indexX: number): number {
        const x = this.virtualBounds.left + (indexX * this.dotsSpacing);
        return x;
    }

    protected calculateDotY(indexY: number): number {
        const y = this.virtualBounds.top + (indexY * this.dotsSpacing);
        return y;
    }

    protected calculateVisibleLeftTopDotIndex(): DotIndex {
        const visibleLeftTop = this.calculateVisibleLeftTop();
        const visibleLeftTopIndex = this.calculateDotIndex(visibleLeftTop);
        return visibleLeftTopIndex;
    }

    protected calculateVisibleLeftTop(): Position {
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

    protected calculateVisibleWidth(): number {
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

    protected calculateVisibleHeight(): number {
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

    protected inVirtualBounds(position: Position): boolean {
        const dotIndex = this.calculateDotIndex(position);
        const calculatedPosition = this.calculateDot(dotIndex);

        const virtualBounds = this.virtualBounds;

        const inVirtualX = (calculatedPosition.x >= virtualBounds.left) && (calculatedPosition.x <= virtualBounds.left + virtualBounds.width);
        const inVirtualY = (calculatedPosition.y >= virtualBounds.top) && (calculatedPosition.y <= virtualBounds.top + virtualBounds.height);

        const isInVirtualBounds = inVirtualX && inVirtualY;

        return isInVirtualBounds;
    }

    protected handleBoundsChange(event: BoundsChangeEvent): void {
        const bounds = event.bounds;
        this.bounds = bounds;
    }

    protected handleZoomIn(): void {
        this.zoomIn();
    }

    protected handleZoomOut(): void {
        this.zoomOut();
    }

    protected handleMoveStart(): void {
        this.invokeMoveStart();
    }

    protected handleMove(event: MoveEvent): void {
        // 1. calculate the diff between last pointer position and the current one
        const diffX = event.currentPosition.x - event.previousPosition.x;
        const diffY = event.currentPosition.y - event.previousPosition.y;

        this.calculateBounds(diffX, diffY);

        //console.log(`diffX: ${diffX}, diffY: ${diffY}`);
    }

    protected handleMoveStop(): void {
        this.invokeMoveStop();
        this.draw();
    }

    protected changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }

    private zoomInSpacing(): void {
        const configSpacing = this.config.dotSpacing;
        const spacing = (this.dotsSpacing < configSpacing.value)
            ? (this.dotsSpacing + this.config.dotSpacing.zoomOutStep)
            : (this.dotsSpacing + this.config.dotSpacing.zoomInStep);

        this.dotsSpacing = spacing;
    }

    private zoomOutSpacing(): void {
        const configSpacing = this.config.dotSpacing;
        const spacing = (this.dotsSpacing > configSpacing.value)
            ? (this.dotsSpacing - this.config.dotSpacing.zoomInStep)
            : (this.dotsSpacing - this.config.dotSpacing.zoomOutStep);

        this.dotsSpacing = spacing;
    }

    private zoomInDots(): void {
        const configDotRadius = this.config.dot.radius;
        this.dotRadius += (this.dotRadius < configDotRadius.value)
            ? configDotRadius.zoomOutStep
            : configDotRadius.zoomInStep;
    }

    private zoomOutDots(): void {
        const configDotRadius = this.config.dot.radius;
        this.dotRadius -= (this.dotRadius > configDotRadius.value)
            ? configDotRadius.zoomInStep
            : configDotRadius.zoomOutStep;
    }

    private zoomInThreads(): void {
        const configThreadWidth = this.config.thread.width;
        this.threadWidth += (this.threadWidth < configThreadWidth.value)
            ? configThreadWidth.zoomOutStep
            : configThreadWidth.zoomInStep;
    }

    private zoomOutThreads(): void {
        const configThreadWidth = this.config.thread.width;
        this.threadWidth -= (this.threadWidth > configThreadWidth.value)
            ? configThreadWidth.zoomInStep
            : configThreadWidth.zoomOutStep;
    }

    private zoomIn(): void {
        this.zoomInSpacing();
        this.zoomInDots();
        this.zoomInThreads();
        this.draw();
    }

    private zoomOut(): void {
        this.zoomOutSpacing();
        this.zoomOutDots();
        this.zoomOutThreads();
        this.draw();
    }

    private invokeRedraw(): void {
        this.virtualMessaging.sendToChannel0();
    }

    private invokeMoveStart(): void {
        this.virtualMessaging.sendToChannel1();
    }

    private invokeMoveStop(): void {
        this.virtualMessaging.sendToChannel2();
    }

    private subscribe(): void {
        const boundsChangeUn = this.inputCanvas.onBoundsChange(this.handleBoundsChange.bind(this));
        super.registerUn(boundsChangeUn);

        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const moveStartUn = this.inputCanvas.onMoveStart(this.handleMoveStart.bind(this));
        super.registerUn(moveStartUn);

        const moveUn = this.inputCanvas.onMove(this.handleMove.bind(this));
        super.registerUn(moveUn);

        const moveStopUn = this.inputCanvas.onMoveStop(this.handleMoveStop.bind(this));
        super.registerUn(moveStopUn);
    }
}