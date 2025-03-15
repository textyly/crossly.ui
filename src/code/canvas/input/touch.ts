import { Bounds } from "../types.js";
import { CanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging2 } from "../../messaging/impl.js";
import { IMessaging2 } from "../../messaging/types.js";
import {
    ZoomInEvent,
    ITouchInput,
    ZoomOutEvent,
    ActiveTouches,
    ZoomInListener,
    ZoomOutListener,
    CanvasEventType,
    TouchEventHandler,
    Position,
} from "./types.js";

export class TouchInput extends CanvasBase implements ITouchInput {
    private readonly messaging: IMessaging2<ZoomInEvent, ZoomOutEvent>;

    private readonly htmlElement: HTMLElement;
    private readonly touchStartHandler: TouchEventHandler;
    private readonly touchEndHandler: TouchEventHandler;
    private readonly touchMoveHandler: TouchEventHandler;
    private readonly touchCancelHandler: TouchEventHandler;

    private currentActiveTouches?: ActiveTouches;
    private lastTouchTime?: number;

    constructor(htmlElement: HTMLElement) {
        super();

        this.htmlElement = htmlElement;
        this.messaging = new Messaging2();

        this.touchStartHandler = this.handleTouchStart.bind(this);
        this.touchEndHandler = this.handleTouchEnd.bind(this);
        this.touchMoveHandler = this.handleTouchMove.bind(this);
        this.touchCancelHandler = this.handleTouchCancel.bind(this);
    }

    public override set bounds(value: Bounds) {
        super.bounds = value;
    }

    public get inZoomMode(): boolean {
        if (this.currentActiveTouches) {
            return true;
        } else {
            if (!this.lastTouchTime) {
                return false;
            } else {
                const now = Date.now();

                // TODO: point to documentation why is that!!! 
                return (now - this.lastTouchTime) < 200;
            }
        }
    }

    public onZoomIn(listener: ZoomInListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onZoomOut(listener: ZoomOutListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public subscribe(): void {
        this.htmlElement.addEventListener(CanvasEventType.TouchStart, this.touchStartHandler);
        this.htmlElement.addEventListener(CanvasEventType.TouchMove, this.touchMoveHandler);
        this.htmlElement.addEventListener(CanvasEventType.TouchEnd, this.touchEndHandler);
        this.htmlElement.addEventListener(CanvasEventType.TouchCancel, this.touchCancelHandler);
    }

    public dispose(): void {
        this.unsubscribe();
        this.messaging.dispose();
    }

    private unsubscribe(): void {
        this.htmlElement.removeEventListener(CanvasEventType.TouchStart, this.touchStartHandler);
        this.htmlElement.removeEventListener(CanvasEventType.TouchMove, this.touchMoveHandler);
        this.htmlElement.removeEventListener(CanvasEventType.TouchEnd, this.touchEndHandler);
        this.htmlElement.removeEventListener(CanvasEventType.TouchCancel, this.touchCancelHandler);
    }

    private handleTouchStart(event: TouchEvent): void {
        const touches = event.touches;
        this.startZoom(touches);

        event.preventDefault();
    }

    private handleTouchMove(event: TouchEvent): void {
        const touches = event.touches;
        this.zoom(touches);

        event.preventDefault();
    }

    private handleTouchEnd(event: TouchEvent): void {
        this.stopZoom();

        event.preventDefault();
    }

    private handleTouchCancel(event: TouchEvent): void {
        this.stopZoom();

        event.preventDefault();
    }

    private startZoom(touches: TouchList): void {
        if (touches.length > 1) {
            this.handleMultipleTouches(touches[0], touches[1]);
        }
    }

    private zoom(touches: TouchList): void {
        if (touches.length > 1) {
            this.handleMultipleTouches(touches[0], touches[1]);
        } else {
            this.removeMultipleTouches();
        }
    }

    private stopZoom(): void {
        this.removeMultipleTouches();
    }

    private handleMultipleTouches(touch1: Touch, touch2: Touch): void {
        if (this.currentActiveTouches) {

            const currentDistance = this.calculateDistance(touch1, touch2);
            let distanceDelta = currentDistance - this.currentActiveTouches.currentDistance;
            const isZoomIn = distanceDelta > 0;
            distanceDelta = Math.abs(distanceDelta);

            // TODO: config 
            if (distanceDelta > 10) {
                const position = this.getPosition(touch1);
                this.invokeZoom(isZoomIn, position);
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

    // TODO: look for better algorithm
    private calculateDistance(finger1: Touch, finger2: Touch) {
        const dx = finger1.clientX - finger2.clientX;
        const dy = finger1.clientY - finger2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private invokeZoom(isZoomIn: boolean, position: Position): void {
        if (isZoomIn) {
            this.invokeZoomIn(position);
        } else {
            this.invokeZoomOut(position);
        }
    }

    private invokeZoomIn(currentPosition: Position): void {
        this.messaging.sendToChannel1({ currentPosition });
    }

    private invokeZoomOut(currentPosition: Position): void {
        this.messaging.sendToChannel2({ currentPosition });
    }

    private getPosition(touch: Touch): Position {
        const x = touch.clientX;
        const y = touch.clientY;
        return { x, y };
    }
}