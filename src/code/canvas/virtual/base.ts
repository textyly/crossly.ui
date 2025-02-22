import { CanvasBase } from "../base.js";
import { Messaging2, Messaging3 } from "../../messaging/impl.js";
import { DotIndex, IVirtualCanvas } from "./types.js";
import { IMessaging2, IMessaging3 } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import { Bounds, CanvasSide, CanvasConfig, BoundsChangeEvent } from "../types.js";
import { IInputCanvas, MoveEvent, MoveListener, Position } from "../input/types.js";

export abstract class VirtualCanvasBase extends CanvasBase implements IVirtualCanvas {
    private readonly configuration: Readonly<CanvasConfig>;
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
        this.configuration = config;

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

    public get config(): CanvasConfig {
        return this.configuration;
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

    protected get virtualBounds(): Bounds {
        const bounds = { left: this.virtualLeft, top: this.virtualTop, width: this.virtualWidth, height: this.virtualHeight };
        return bounds;
    }

    private set virtualBounds(value: Bounds) {
        const newLeft = value.left;
        const newTop = value.top;
        const newWidth = value.width;
        const newHeight = value.height;

        if (this.virtualLeft !== newLeft || this.virtualTop !== newTop || this.virtualWidth !== newWidth || this.virtualHeight !== newHeight) {
            this.virtualLeft = newLeft;
            this.virtualTop = newTop;
            this.virtualWidth = newWidth;
            this.virtualHeight = newHeight;
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

    protected calculateDotIndex(position: Position): DotIndex {
        const closestX = (position.x - this.virtualBounds.left) / this.dotsSpacing;
        const closestY = (position.y - this.virtualBounds.top) / this.dotsSpacing;

        const indexX = Math.round(closestX);
        const indexY = Math.round(closestY);

        const index = { indexX, indexY };
        return index;
    }

    protected calculateDotPosition(index: DotIndex): Position {
        const x = this.calculateDotXPosition(index.indexX)
        const y = this.calculateDotYPosition(index.indexY)
        return { x, y };
    }

    protected calculateDotXPosition(indexX: number): number {
        const x = this.virtualBounds.left + (indexX * this.dotsSpacing);
        return x;
    }

    protected calculateDotYPosition(indexY: number): number {
        const y = this.virtualBounds.top + (indexY * this.dotsSpacing);
        return y;
    }

    protected calculateVisibleLeftTopDotIndex(): DotIndex {
        const leftTopDotPosition = this.calculateVisibleLeftTopDotPosition();
        const leftTopDotIndex = this.calculateDotIndex(leftTopDotPosition);
        return leftTopDotIndex;
    }

    protected calculateVisibleLeftTopDotPosition(): Position {
        const visibleBounds = this.inputCanvas.bounds;

        const leftTopX = this.virtualBounds.left < visibleBounds.left
            ? visibleBounds.left
            : Math.min(this.virtualBounds.left, (visibleBounds.left + visibleBounds.width));

        const leftTopY = this.virtualBounds.top < visibleBounds.top
            ? visibleBounds.top
            : Math.min(this.virtualBounds.top, (visibleBounds.top + visibleBounds.height));

        const leftTopDot = { x: leftTopX, y: leftTopY };

        return leftTopDot;
    }

    protected calculateVisibleWidth(): number {
        const visibleBounds = this.inputCanvas.bounds;

        if (this.virtualBounds.left < visibleBounds.left) {
            const virtualWidth = this.virtualBounds.width - (Math.abs(this.virtualBounds.left) + Math.abs(visibleBounds.left));
            return Math.min(virtualWidth, visibleBounds.width);
        } else {
            const offsetBoundsWidth = visibleBounds.left + visibleBounds.width;
            const offsetVirtualWidth = this.virtualBounds.left + this.virtualBounds.width;

            if (offsetVirtualWidth <= offsetBoundsWidth) {
                return this.virtualBounds.width;
            } else {
                return (visibleBounds.width - this.virtualBounds.left);
            }
        }
    }

    protected calculateVisibleHeight(): number {
        const visibleBounds = this.inputCanvas.bounds;

        if (this.virtualBounds.top < visibleBounds.top) {
            const virtualHeight = this.virtualBounds.height - (Math.abs(this.virtualBounds.top) + Math.abs(visibleBounds.top));
            return Math.min(virtualHeight, visibleBounds.height);
        } else {
            const offsetBoundsHeight = visibleBounds.top + visibleBounds.height;
            const offsetVirtualHeight = this.virtualBounds.top + this.virtualBounds.height;

            if (offsetVirtualHeight <= offsetBoundsHeight) {
                return this.virtualBounds.height;
            } else {
                return (visibleBounds.height - this.virtualBounds.top);
            }
        }
    }

    protected isInVirtualBounds(position: Position): boolean {
        const dotIndex = this.calculateDotIndex(position);
        const newPosition = this.calculateDotPosition(dotIndex);
        const x = newPosition.x;
        const y = newPosition.y;

        const vBounds = this.virtualBounds;
        const vX = vBounds.left;
        const vY = vBounds.top;
        const vWidth = vBounds.width;
        const vHeight = vBounds.height;

        const isInVirtualX = x >= vX && (x <= vX + vWidth);
        const isInVirtualY = y >= vY && (y <= vY + vHeight);
        const isInVirtualBounds = isInVirtualX && isInVirtualY;

        return isInVirtualBounds;
    }

    protected changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
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

        //console.log(`diffX: ${diffX}, diffY: ${diffY}`);

        this.calculateBounds(diffX, diffY);
    }

    protected handleMoveStop(): void {
        this.invokeMoveStop();
        this.draw();
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

    private calculateBounds(differenceX: number = 0, differenceY: number = 0): void {
        this.calculateVirtualBounds(differenceX, differenceY);
        this.calculateVisibleBounds();
    }

    private calculateVirtualBounds(differenceX: number = 0, differenceY: number = 0): void {
        const left = this.virtualBounds.left + differenceX;
        const top = this.virtualBounds.top + differenceY;

        const width = (this.allDotsX - 1) * this.dotsSpacing;
        const height = (this.allDotsY - 1) * this.dotsSpacing;

        this.virtualBounds = { left, top, width, height };
    }

    private calculateVisibleBounds(): void {
        const leftTopPosition = this.calculateVisibleLeftTopDotPosition();
        const width = this.calculateVisibleWidth();
        const height = this.calculateVisibleHeight();

        this.bounds = { left: leftTopPosition.x, top: leftTopPosition.y, width, height };
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
}