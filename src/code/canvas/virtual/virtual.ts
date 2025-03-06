import { Messaging2 } from "../../messaging/impl.js";
import { IMessaging2 } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import { IInputCanvas, MoveEvent, MoveStartEvent, MoveStopEvent } from "../input/types.js";
import { Bounds, BoundsChangeEvent, BoundsIndexes, CanvasConfig, CanvasSide } from "../types.js";
import { IVirtualCanvas } from "./types.js";
import calculator from "../../utilities/canvas/calculator.js";
import { CanvasBase } from "../base.js";

export abstract class VirtualCanvasBase extends CanvasBase implements IVirtualCanvas {
    private readonly virtualMessaging: IMessaging2<void, void>;
    protected readonly inputCanvas: IInputCanvas;
    protected readonly config: Readonly<CanvasConfig>;

    private virtualLeft = 0;
    private virtualTop = 0;
    private virtualWidth = 0;
    private virtualHeight = 0;

    protected dotsSpacing: number;
    protected movingBounds?: Bounds;

    protected dotColor: string;
    protected dotRadius: number;

    protected threadColor: string;
    protected threadWidth: number;

    protected currentSide: CanvasSide;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super();
        this.inputCanvas = inputCanvas;
        this.config = config;

        this.virtualMessaging = new Messaging2();
        this.currentSide = CanvasSide.Back;

        const dotConfig = config.dot;
        this.dotColor = dotConfig.color;
        this.dotRadius = dotConfig.radius.value;
        this.dotsSpacing = config.dotSpacing.value / 2;

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
        return this.movingBounds ?? this.inputCanvas.bounds;
    }

    protected get drawingBoundsIndexes(): BoundsIndexes {
        const virtualBounds = this.virtualBounds;
        const visibleBounds = this.visibleBounds;

        const leftTop = calculator.calculateDrawingLeftTop(virtualBounds, visibleBounds);
        const leftTopIndex = calculator.calculateDrawingIndex(virtualBounds, leftTop, this.dotsSpacing);

        const width = calculator.calculateDrawingWidth(virtualBounds, visibleBounds);
        const rightTop = { x: leftTop.x + width, y: leftTop.y };
        const rightTopIndex = calculator.calculateDrawingIndex(virtualBounds, rightTop, this.dotsSpacing);

        const height = calculator.calculateDrawingHeight(virtualBounds, visibleBounds);
        const leftBottom = { x: leftTop.x, y: leftTop.y + height };
        const leftBottomIndex = calculator.calculateDrawingIndex(virtualBounds, leftBottom, this.dotsSpacing);

        const rightBottom = { x: leftTop.x + width, y: leftTop.y + height };
        const rightBottomIndex = calculator.calculateDrawingIndex(virtualBounds, rightBottom, this.dotsSpacing);

        const boundsIndexes = {
            leftTop: leftTopIndex,
            rightTop: rightTopIndex,
            leftBottom: leftBottomIndex,
            rightBottom: rightBottomIndex
        };

        return boundsIndexes;
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

    protected set virtualBounds(value: Bounds) {
        const hasChange = (this.virtualLeft !== value.left) || (this.virtualTop !== value.top) || (this.virtualWidth !== value.width) || (this.virtualHeight !== value.height);
        if (hasChange) {
            this.virtualLeft = value.left;
            this.virtualTop = value.top;
            this.virtualWidth = value.width;
            this.virtualHeight = value.height;
        }
    }

    protected recalculateBounds(): void {
        this.virtualBounds = calculator.calculateVirtualBounds(this.virtualBounds, this.allDotsX, this.allDotsY, this.dotsSpacing, 0, 0);
        this.bounds = calculator.calculateDrawingBounds(this.virtualBounds, this.visibleBounds);
    }

    public draw(): void {
        this.invokeRedraw();
        this.recalculateBounds();
        this.redraw();
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

    protected abstract redraw(): void;

    protected changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }

    private handleBoundsChange(event: BoundsChangeEvent): void {
        const bounds = event.bounds;
        this.bounds = bounds;
    }

    private handleZoomIn(): void {
        this.zoomIn();
    }

    private handleZoomOut(): void {
        this.zoomOut();
    }

    protected handleMoveStart(event: MoveStartEvent): void {
        const currentPosition = event.currentPosition;
        const previousPosition = event.previousPosition;

        const diffX = currentPosition.x - previousPosition.x;
        const diffY = currentPosition.y - previousPosition.y;

        const inDrawingBounds = calculator.inDrawingBounds(this.virtualBounds, currentPosition, this.dotsSpacing);
        if (!inDrawingBounds) {
            return;
        }

        this.virtualBounds = calculator.calculateVirtualBounds(this.virtualBounds, this.allDotsX, this.allDotsY, this.dotsSpacing, diffX, diffY);
        super.bounds = calculator.calculateDrawingBounds(this.virtualBounds, this.visibleBounds);

        const bounds = this.bounds;
        const visibleBounds = this.visibleBounds;
        const virtualBounds = this.virtualBounds;

        this.bounds = calculator.calculateMovingBounds(currentPosition, bounds, visibleBounds, virtualBounds);
        this.movingBounds = this.bounds;

        // console.log(`bounds: ${JSON.stringify(bounds)}`);
        // console.log(`virtual bounds: ${JSON.stringify(this.virtualBounds)}`);
        // console.log(`new bounds: ${JSON.stringify(this.bounds)}`);

        this.redraw();
        this.invokeMoveStart();
    }

    private handleMove(event: MoveEvent): void {
        // 1. calculate the diff between last pointer position and the current one
        const currentPosition = event.currentPosition;
        const previousPosition = event.previousPosition;

        if (!this.movingBounds) {
            return;
        }

        const diffX = currentPosition.x - previousPosition.x;
        const diffY = currentPosition.y - previousPosition.y;

        this.virtualBounds = calculator.calculateVirtualBounds(this.virtualBounds, this.allDotsX, this.allDotsY, this.dotsSpacing, diffX, diffY);

        const bounds = this.bounds;
        this.bounds = { left: bounds.left + diffX, top: bounds.top + diffY, width: bounds.width, height: bounds.height };

        // TODO: use bounds width and height
        // this.bounds = { left: bounds.left, top: bounds.top, width: this.bounds.width, height: this.bounds.height };

        // console.log(`visible bounds: ${JSON.stringify(this.visibleBounds)}`);
        // console.log(`virtual bounds: ${JSON.stringify(this.virtualBounds)}`);
        // console.log(`bounds: ${JSON.stringify(this.bounds)}`);
    }

    private handleMoveStop(event: MoveStopEvent): void {
        if (this.movingBounds) {
            this.movingBounds = undefined;
            this.invokeMoveStop();
            this.draw();
        }
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

    private invokeRedraw(): void {
        this.virtualMessaging.sendToChannel0();
    }

    private invokeMoveStart(): void {
        this.virtualMessaging.sendToChannel1();
    }

    private invokeMoveStop(): void {
        this.virtualMessaging.sendToChannel2();
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
}