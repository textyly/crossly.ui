import { IVirtualCanvas } from "./types.js";
import assert from "../../asserts/assert.js";
import { CanvasConfig } from "../../config/types.js";
import { Messaging2 } from "../../messaging/impl.js";
import { IMessaging2 } from "../../messaging/types.js";
import { VirtualCanvasDimensions } from "./dimensions.js";
import { BoundsChangeEvent, CanvasSide } from "../types.js";
import { VoidEvent, VoidListener, VoidUnsubscribe } from "../../types.js";
import { IInputCanvas, MoveEvent, MoveStartEvent, MoveStopEvent, ZoomInEvent, ZoomOutEvent } from "../input/types.js";

export abstract class VirtualCanvasBase extends VirtualCanvasDimensions implements IVirtualCanvas {
    private readonly virtualMessaging: IMessaging2<VoidEvent, VoidEvent>;

    protected currentSide: CanvasSide;

    constructor(className: string, config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(className, config, inputCanvas);

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
        super.ensureAlive();

        this.invokeRedraw();
        this.recalculateBounds();
        this.redraw();
    }

    public zoomIn(): void {
        const center = super.calculateDrawingCenter();
        this.handleZoomIn({ currentPosition: center });
    }

    public zoomOut(): void {
        const center = super.calculateDrawingCenter();
        this.handleZoomOut({ currentPosition: center });
    }

    public override dispose(): void {
        super.ensureAlive();
        this.virtualMessaging.dispose();
        super.dispose();
    }

    protected abstract zoomInCore(): void;
    protected abstract zoomOutCore(): void;
    protected abstract redraw(): void;

    protected changeCanvasSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }

    protected handleVisibleBoundsChange(event: BoundsChangeEvent): void {
        super.ensureAlive();

        this.draw();
    }

    private handleZoomIn(event: ZoomInEvent): void {
        super.ensureAlive();

        const currentPosition = event.currentPosition;
        assert.positive(currentPosition.x, "currentPosition");
        assert.positive(currentPosition.y, "currentPosition");

        const inBounds = this.inBounds(currentPosition);
        if (inBounds) {
            this.zoomInCanvas(currentPosition);
            this.zoomInCore();
            this.draw();
        }
    }

    private handleZoomOut(event: ZoomOutEvent): void {
        super.ensureAlive();

        const currentPosition = event.currentPosition;
        assert.positive(currentPosition.x, "currentPosition.x");
        assert.positive(currentPosition.y, "currentPosition.y");

        const inBounds = this.inBounds(currentPosition);
        const minSpace = this.dotsSpaceZoomStep;

        if (inBounds && (this.currentDotsSpace > minSpace)) {
            this.zoomOutCanvas(currentPosition);
            this.zoomOutCore();
            this.draw();
        }
    }

    private handleMoveStart(event: MoveStartEvent): void {
        super.ensureAlive();

        const currentPosition = event.currentPosition;
        assert.positive(currentPosition.x, "currentPosition.x");
        assert.positive(currentPosition.y, "currentPosition.y");

        const previousPosition = event.previousPosition;
        assert.positive(previousPosition.x, "previousPosition.x");
        assert.positive(previousPosition.y, "previousPosition.y");

        const inBounds = this.inBounds(currentPosition);
        if (inBounds) {
            this.startMove(currentPosition, previousPosition);
            this.redraw(); // TODO: should be draw but it does not work
            this.invokeMoveStart();
        }
    }

    private handleMove(event: MoveEvent): void {
        super.ensureAlive();

        if (this.inMovingMode) {

            const currentPosition = event.currentPosition;

            assert.positive(currentPosition.x, "currentPosition.x");
            assert.positive(currentPosition.y, "currentPosition.y");

            const previousPosition = event.previousPosition;
            assert.positive(previousPosition.x, "previousPosition.x");
            assert.positive(previousPosition.y, "previousPosition.y");

            this.move(currentPosition, previousPosition);
        }
    }

    private handleMoveStop(event: MoveStopEvent): void {
        super.ensureAlive();

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
        const event: VoidEvent = {};
        this.virtualMessaging.sendToChannel1(event);
    }

    private invokeMoveStop(): void {
        const event: VoidEvent = {};
        this.virtualMessaging.sendToChannel2(event);
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
}