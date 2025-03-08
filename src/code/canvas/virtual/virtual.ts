import { IVirtualCanvas } from "./types.js";
import { Messaging2 } from "../../messaging/impl.js";
import { IMessaging2 } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import { VirtualCanvasDimensions } from "../utilities/calculator.js";
import { BoundsChangeEvent, CanvasConfig, CanvasSide } from "../types.js";
import { IInputCanvas, MoveEvent, MoveStartEvent, MoveStopEvent } from "../input/types.js";

export abstract class VirtualCanvasBase extends VirtualCanvasDimensions implements IVirtualCanvas {
    protected readonly config: Readonly<CanvasConfig>;
    private readonly virtualMessaging: IMessaging2<void, void>;

    protected dotColor: string;
    protected dotRadius: number;
    protected dotsSpacing: number;

    protected threadColor: string;
    protected threadWidth: number;

    protected currentSide: CanvasSide;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(inputCanvas);

        this.config = config;

        this.virtualMessaging = new Messaging2();
        this.currentSide = CanvasSide.Back;

        this.dotColor = config.dot.color;
        this.dotRadius = config.dot.radius.value;
        this.dotsSpacing = config.dotSpacing.value / 2;

        this.threadColor = config.thread.color;
        this.threadWidth = config.thread.width.value;

        this.subscribe();
    }

    private get allDotsY(): number {
        const invisibleRows = this.config.rows - 1;
        const all = this.config.rows + invisibleRows;
        return all;
    }

    private get allDotsX(): number {
        const invisibleColumns = this.config.columns - 1;
        const all = this.config.columns + invisibleColumns;
        return all;
    }

    public draw(): void {
        this.invokeRedraw();

        this.virtualBounds = this.calculateVirtualBounds(this.virtualBounds, this.allDotsX, this.allDotsY, this.dotsSpacing, 0, 0);
        this.bounds = this.calculateDrawingBounds(this.virtualBounds, this.visibleBounds);

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

    private handleMoveStart(event: MoveStartEvent): void {
        const currentPosition = event.currentPosition;
        const previousPosition = event.previousPosition;

        const inVirtualBounds = this.inVirtualBounds(this.virtualBounds, currentPosition, this.dotsSpacing);
        if (!inVirtualBounds) {
            return;
        }

        const diffX = currentPosition.x - previousPosition.x;
        const diffY = currentPosition.y - previousPosition.y;

        this.virtualBounds = this.calculateVirtualBounds(this.virtualBounds, this.allDotsX, this.allDotsY, this.dotsSpacing, diffX, diffY);
        this.bounds = this.calculateDrawingBounds(this.virtualBounds, this.visibleBounds);

        const movingBounds = this.calculateMovingBounds(currentPosition, this.bounds, this.visibleBounds, this.virtualBounds);
        this._movingBounds = this.bounds = movingBounds;

        this.redraw();
        this.invokeMoveStart();
    }

    private handleMove(event: MoveEvent): void {
        if (!this.inMovingMode) {
            return;
        }

        const currentPosition = event.currentPosition;
        const previousPosition = event.previousPosition;

        const diffX = currentPosition.x - previousPosition.x;
        const diffY = currentPosition.y - previousPosition.y;

        this.virtualBounds = this.calculateVirtualBounds(this.virtualBounds, this.allDotsX, this.allDotsY, this.dotsSpacing, diffX, diffY);

        const bounds = this.bounds;
        this.bounds = { left: bounds.left + diffX, top: bounds.top + diffY, width: bounds.width, height: bounds.height };
    }

    private handleMoveStop(event: MoveStopEvent): void {
        if (!this.inMovingMode) {
            return;
        }

        this._movingBounds = undefined;
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