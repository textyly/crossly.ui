import { IVirtualCanvas } from "./types.js";
import { Messaging2 } from "../../messaging/impl.js";
import { IMessaging2 } from "../../messaging/types.js";
import { VirtualCanvasDimensions } from "./dimensions.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import { BoundsChangeEvent, CanvasConfig, CanvasSide } from "../types.js";
import { IInputCanvas, MoveEvent, MoveStartEvent, MoveStopEvent, ZoomInEvent, ZoomOutEvent } from "../input/types.js";

export abstract class VirtualCanvasBase extends VirtualCanvasDimensions implements IVirtualCanvas {
    private readonly virtualMessaging: IMessaging2<void, void>;

    protected currentSide: CanvasSide;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);

        this.virtualMessaging = new Messaging2();
        this.currentSide = CanvasSide.Back;

        this.subscribe();
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

    public draw(): void {
        this.invokeRedraw();
        this.recalculateBounds();
        this.redraw();
    }

    public override dispose(): void {
        this.virtualMessaging.dispose();
        super.dispose();
    }

    protected abstract redraw(): void;
    protected abstract zoomIn(): void;
    protected abstract zoomOut(): void;

    protected changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }

    private subscribe(): void {
        const boundsChangeUn = this.inputCanvas.onBoundsChange(this.handleVisibleBoundsChange.bind(this));
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

    private handleVisibleBoundsChange(event: BoundsChangeEvent): void {
        this.bounds = event.bounds; // TODO: probably will stop working once visible div start changing bounds on resize and minimize/maximize/restore
    }

    private handleZoomIn(event: ZoomInEvent): void {
        const inBounds = this.inBounds(event.currentPosition);
        if (inBounds) {
            this.zoomInCanvas(event.currentPosition);
            this.zoomIn();
            this.draw();
        }
    }

    private handleZoomOut(event: ZoomOutEvent): void {
        const inBounds = this.inBounds(event.currentPosition);
        const minSpace = this.config.dotsSpacing.minSpace / 2;

        if (inBounds && (this.dotsSpace > minSpace)) {
            this.zoomOutCanvas(event.currentPosition);
            this.zoomOut();
            this.draw();
        }
    }

    private handleMoveStart(event: MoveStartEvent): void {
        const currentPosition = event.currentPosition;
        const previousPosition = event.previousPosition;

        const inBounds = this.inBounds(currentPosition);
        if (inBounds) {
            this.startMove(currentPosition, previousPosition);
            this.redraw(); // TODO: should be draw but it does not work
            this.invokeMoveStart();
        }
    }

    private handleMove(event: MoveEvent): void {
        if (this.inMovingMode) {
            const currentPosition = event.currentPosition;
            const previousPosition = event.previousPosition;
            this.move(currentPosition, previousPosition);
        }
    }

    private handleMoveStop(event: MoveStopEvent): void {
        if (this.inMovingMode) {
            this.stopMove();
            this.invokeMoveStop();
            this.draw();
        }
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