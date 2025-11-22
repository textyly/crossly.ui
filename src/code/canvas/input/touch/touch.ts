import { TouchInputBase } from "./base.js";
import assert from "../../../asserts/assert.js";
import { Position, ITouchInput, ActiveTouches, CanvasEventType, TouchEventHandler } from "../types.js";

export class TouchInput extends TouchInputBase implements ITouchInput {
    private readonly ignoreZoomUntil: number;
    private readonly htmlElement: HTMLElement;

    private readonly touchStartHandler: TouchEventHandler;
    private readonly touchEndHandler: TouchEventHandler;
    private readonly touchMoveHandler: TouchEventHandler;
    private readonly touchCancelHandler: TouchEventHandler;

    private currentActiveTouches?: ActiveTouches;
    private lastTouchTime?: number;

    constructor(ignoreZoomUntil: number, htmlElement: HTMLElement) {
        super(TouchInput.name);

        this.ignoreZoomUntil = ignoreZoomUntil;
        assert.greaterThanZero(ignoreZoomUntil, "ignoreZoomUntil");

        this.htmlElement = htmlElement;

        this.touchStartHandler = this.handleTouchStart.bind(this);
        this.touchEndHandler = this.handleTouchEnd.bind(this);
        this.touchMoveHandler = this.handleTouchMove.bind(this);
        this.touchCancelHandler = this.handleTouchCancel.bind(this);
    }

    public get inZoomMode(): boolean {
        super.ensureAlive();

        if (this.currentActiveTouches) {
            return true;
        } else {
            if (!this.lastTouchTime) {
                return false;
            } else {
                const now = Date.now();

                // TODO: point to documentation why is that!!! 
                return (now - this.lastTouchTime) < 200; // TODO: config
            }
        }
    }
    public override dispose(): void {
        super.ensureAlive();
        this.unsubscribe();
        super.dispose();
    }

    private handleTouchStart(event: TouchEvent): void {
        super.ensureAlive();

        const touches = event.touches;
        this.tryStartZoom(touches);

        event.preventDefault();
    }

    private handleTouchMove(event: TouchEvent): void {
        super.ensureAlive();

        const touches = event.touches;
        this.tryZoom(touches);

        event.preventDefault();
    }

    private handleTouchEnd(event: TouchEvent): void {
        super.ensureAlive();

        this.tryStopZoom();

        event.preventDefault();
    }

    private handleTouchCancel(event: TouchEvent): void {
        super.ensureAlive();

        this.tryStopZoom();

        event.preventDefault();
    }

    private tryStartZoom(touches: TouchList): void {
        if (touches.length > 1) {
            const touch1 = touches[0];
            const touch2 = touches[1];

            const pos1 = this.getPosition(touch1);
            const pos2 = this.getPosition(touch2);

            const isVisible = this.isVisible(pos1) && this.isVisible(pos2);

            if (isVisible) {
                this.zoom(touch1, touch2);
            }
        }
    }

    private tryZoom(touches: TouchList): void {
        if (touches.length <= 1) {
            this.stopZoom();
        } else {
            const touch1 = touches[0];
            const touch2 = touches[1];

            const pos1 = this.getPosition(touch1);
            const pos2 = this.getPosition(touch2);

            const isVisible = this.isVisible(pos1) && this.isVisible(pos2);

            if (isVisible) {
                this.zoom(touch1, touch2);
            }
        }
    }

    private tryStopZoom(): void {
        this.stopZoom();
    }

    private zoom(touch1: Touch, touch2: Touch): void {
        if (this.currentActiveTouches) {
            const currentDistance = this.calculateDistance(touch1, touch2);
            let distanceDelta = currentDistance - this.currentActiveTouches.currentDistance;
            const isZoomIn = distanceDelta > 0;
            distanceDelta = Math.abs(distanceDelta);

            if (distanceDelta > this.ignoreZoomUntil) {

                const middlePos = this.getMiddle(touch1, touch2);
                this.invokeZoom(isZoomIn, middlePos);

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

    private invokeZoom(isZoomIn: boolean, position: Position): void {
        if (isZoomIn) {
            this.invokeZoomIn(position);
        } else {
            this.invokeZoomOut(position);
        }
    }

    private stopZoom(): void {
        if (this.currentActiveTouches) {
            this.currentActiveTouches = undefined;
        }
    }

    private calculateDistance(finger1: Touch, finger2: Touch) {
        const dx = finger1.clientX - finger2.clientX;
        const dy = finger1.clientY - finger2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private getMiddle(touch1: Touch, touch2: Touch): Position {
        const pos1 = this.getPosition(touch1);
        const pos2 = this.getPosition(touch2);

        const posXDiff = Math.abs(pos1.x - pos2.x);
        const topXTouch = Math.min(pos1.x, pos2.x);
        const x = topXTouch + (posXDiff / 2);

        const posYDiff = Math.abs(pos1.y - pos2.y);
        const topYTouch = Math.min(pos1.y, pos2.y);
        const y = topYTouch + (posYDiff / 2);

        const middle = { x, y };
        return middle;
    }

    private isVisible(position: Position): boolean {
        return position.x > 0 && position.y > 0;
    }

    private getPosition(touch: Touch): Position {
        const x = touch.clientX;
        const y = touch.clientY;
        return { x, y };
    }

    public subscribe(): void {
        this.htmlElement.addEventListener(CanvasEventType.TouchStart, this.touchStartHandler);
        this.htmlElement.addEventListener(CanvasEventType.TouchMove, this.touchMoveHandler);
        this.htmlElement.addEventListener(CanvasEventType.TouchEnd, this.touchEndHandler);
        this.htmlElement.addEventListener(CanvasEventType.TouchCancel, this.touchCancelHandler);
    }

    private unsubscribe(): void {
        this.htmlElement.removeEventListener(CanvasEventType.TouchStart, this.touchStartHandler);
        this.htmlElement.removeEventListener(CanvasEventType.TouchMove, this.touchMoveHandler);
        this.htmlElement.removeEventListener(CanvasEventType.TouchEnd, this.touchEndHandler);
        this.htmlElement.removeEventListener(CanvasEventType.TouchCancel, this.touchCancelHandler);
    }
}