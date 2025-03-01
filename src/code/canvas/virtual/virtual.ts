import { Messaging2 } from "../../messaging/impl.js";
import { IMessaging2 } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import { IInputCanvas, MoveEvent, MoveStartEvent, MoveStopEvent } from "../input/types.js";
import { BoundsChangeEvent, CanvasConfig, CanvasSide } from "../types.js";
import { VirtualCanvasCalculator } from "./calculator.js";
import { IVirtualCanvas } from "./types.js";

export abstract class VirtualCanvasBase extends VirtualCanvasCalculator implements IVirtualCanvas {
    private readonly virtualMessaging: IMessaging2<void, void>;
    protected dotColor: string;
    protected dotRadius: number;

    protected threadColor: string;
    protected threadWidth: number;

    protected currentSide: CanvasSide;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);

        this.virtualMessaging = new Messaging2();
        this.currentSide = CanvasSide.Back;

        const dotConfig = config.dot;
        this.dotColor = dotConfig.color;
        this.dotRadius = dotConfig.radius.value;

        const threadConfig = config.thread;
        this.threadColor = threadConfig.color;
        this.threadWidth = threadConfig.width.value;

        this.subscribe();
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

        const inDrawingBounds = this.inDrawingBounds(currentPosition);
        if (!inDrawingBounds) {
            return;
        }

        super.virtualBounds = this.calculateVirtualBounds(diffX, diffY);
        super.bounds = this.calculateDrawingBounds(this.virtualBounds, this.visibleBounds);

        const bounds = this.bounds;
        const visibleBounds = this.visibleBounds;
        const virtualBounds = this.virtualBounds;

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

        this.bounds = { left, top, width, height };
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

        super.virtualBounds = this.calculateVirtualBounds(diffX, diffY);

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