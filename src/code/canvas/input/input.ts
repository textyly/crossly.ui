import { Size } from "../types.js";
import { InputCanvasBase } from "./base.js";
import {
    ActiveTouches,
    CanvasEventsType,
    IInputCanvas,
    PointerEventHandler,
    Position,
    TouchEventHandler,
    WheelChangeHandler
} from "./types.js";

export class InputCanvas extends InputCanvasBase implements IInputCanvas {
    private readonly htmlElement: HTMLElement;
    private readonly wheelChangeHandler: WheelChangeHandler;
    private readonly pointerMoveHandler: PointerEventHandler;
    private readonly pointerHoldingDownHandler: PointerEventHandler;
    private readonly pointerUpHandler: PointerEventHandler;
    private readonly pointerCancelHandler: PointerEventHandler;

    private readonly touchStartHandler: TouchEventHandler;
    private readonly touchEndHandler: TouchEventHandler;
    private readonly touchMoveHandler: TouchEventHandler;
    private readonly touchCancelHandler: TouchEventHandler;

    private currentActiveTouches?: ActiveTouches;
    private lastTouchTime?: number;

    constructor(htmlElement: HTMLElement) {
        super();

        this.htmlElement = htmlElement;

        this.wheelChangeHandler = this.handleWheelChange.bind(this);
        this.pointerMoveHandler = this.handlePointerMove.bind(this);
        this.pointerHoldingDownHandler = this.handlePointerDown.bind(this);
        this.pointerUpHandler = this.handlePointerUp.bind(this);
        this.pointerCancelHandler = this.handlePointerCancel.bind(this);

        this.touchStartHandler = this.handleTouchStart.bind(this);
        this.touchEndHandler = this.handleTouchEnd.bind(this);
        this.touchMoveHandler = this.handleTouchMove.bind(this);
        this.touchCancelHandler = this.handleTouchCancel.bind(this);

        this.subscribe();
    }

    public override set size(value: Size) {
        super.size = value;
        const width = value.width.toString() + "px";
        const height = value.height.toString() + "px";

        this.htmlElement.style.width = width;
        this.htmlElement.style.height = height;
    }

    public override dispose(): void {
        this.htmlElement.removeEventListener(CanvasEventsType.WheelChange, this.wheelChangeHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.PointerDown, this.pointerHoldingDownHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.PointerUp, this.pointerUpHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.PointerCancel, this.pointerCancelHandler);

        this.htmlElement.removeEventListener(CanvasEventsType.TouchStart, this.touchStartHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.TouchEnd, this.touchEndHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.TouchMove, this.touchMoveHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.TouchCancel, this.touchCancelHandler);

        super.dispose();
    }

    private get inZoom(): boolean {
        if (this.currentActiveTouches) {
            return true;
        } else {
            if (!this.lastTouchTime) {
                return false;
            } else {
                const now = Date.now();
                return (now - this.lastTouchTime) < 500;
            }
        }
    }

    private subscribe(): void {
        this.htmlElement.addEventListener(CanvasEventsType.WheelChange, this.wheelChangeHandler);
        this.htmlElement.addEventListener(CanvasEventsType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.addEventListener(CanvasEventsType.PointerDown, this.pointerHoldingDownHandler);
        this.htmlElement.addEventListener(CanvasEventsType.PointerUp, this.pointerUpHandler);
        this.htmlElement.addEventListener(CanvasEventsType.PointerCancel, this.pointerCancelHandler);

        this.htmlElement.addEventListener(CanvasEventsType.TouchStart, this.touchStartHandler);
        this.htmlElement.addEventListener(CanvasEventsType.TouchEnd, this.touchEndHandler);
        this.htmlElement.addEventListener(CanvasEventsType.TouchMove, this.touchMoveHandler);
        this.htmlElement.addEventListener(CanvasEventsType.TouchCancel, this.touchCancelHandler);
    }

    private handleWheelChange(event: WheelEvent): void {
        if (event.ctrlKey) {
            const deltaY = event.deltaY;
            deltaY < 0 ? super.invokeZoomIn() : super.invokeZoomOut();
            event.preventDefault();
        }
    }

    private handlePointerMove(event: PointerEvent): void {
        if (this.inZoom) {
            return;
        }

        const position = this.getPosition(event);
        super.invokePointerMove(position);
    }

    private handlePointerDown(event: PointerEvent): void {
        // TODO:
        // super.invokePointerHoldingDown();
    }

    private handlePointerUp(event: PointerEvent): void {
        if (this.inZoom) {
            return;
        }

        const position = this.getPosition(event);
        const leftButton = 0;
        if (event.button === leftButton) {
            super.invokePointerUp(position);
        }
    }

    private handlePointerCancel(event: PointerEvent): void {
    }

    private handleTouchStart(event: TouchEvent): void {
        const touches = event.touches;
        if (touches.length > 1) {
            this.handleMultipleTouches(touches[0], touches[1]);
        }
        event.preventDefault();
    }

    private handleTouchEnd(event: TouchEvent): void {
        this.removeMultipleTouches();
        event.preventDefault();
    }

    private handleTouchMove(event: TouchEvent): void {
        const touches = event.touches;
        if (touches.length > 1) {
            this.handleMultipleTouches(touches[0], touches[1]);
        } else {
            this.removeMultipleTouches();
        }
        event.preventDefault();
    }

    private handleTouchCancel(event: TouchEvent): void {
        this.removeMultipleTouches();
        event.preventDefault();
    }

    private handleMultipleTouches(touch1: Touch, touch2: Touch): void {
        if (this.currentActiveTouches) {
            // TODO: zoomin, zoomout
            const currentDistance = this.calculateDistance(touch1, touch2);
            const distanceDelta = currentDistance - this.currentActiveTouches.currentDistance;
            const isZoomIn = distanceDelta > 0;

            if (Math.abs(distanceDelta) > 10) {
                if (isZoomIn) {
                    super.invokeZoomIn();
                } else {
                    super.invokeZoomOut();
                }
                this.currentActiveTouches.currentDistance = currentDistance;
            }
        } else {
            const newActiveTouches = {
                currentDistance: this.calculateDistance(touch1, touch2)
            }
            this.currentActiveTouches = newActiveTouches;
        }
        this.lastTouchTime = Date.now();
    }

    private removeMultipleTouches(): void {
        if (this.currentActiveTouches) {
            this.currentActiveTouches = undefined;
        }
    }

    private getPosition(event: PointerEvent): Position {
        const rect = this.htmlElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    private calculateDistance(finger1: Touch, finger2: Touch) {
        const dx = finger1.clientX - finger2.clientX;
        const dy = finger1.clientY - finger2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}