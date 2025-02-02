import { Bounds } from "../types.js";
import { CanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import {
    Position,
    MoveEvent,
    ITouchInput,
    MoveListener,
    CanvasEventType,
    PointerEventHandler,
} from "./types.js";

export class MoveInput extends CanvasBase {
    private readonly messaging: IMessaging1<MoveEvent>;

    private readonly htmlElement: HTMLElement;
    private readonly touchInput: ITouchInput;

    private readonly pointerUpHandler: PointerEventHandler;
    private readonly pointerMoveHandler: PointerEventHandler;
    private readonly pointerDownHandler: PointerEventHandler;

    private currentMove?: Position;
    private isPointerDownHeld: boolean;
    private pointerDownHeldPosition?: Position;

    constructor(htmlElement: HTMLElement, touchInput: ITouchInput) {
        super();
        this.htmlElement = htmlElement;
        this.touchInput = touchInput;

        this.messaging = new Messaging1();

        this.pointerUpHandler = this.handlePointerUp.bind(this);
        this.pointerMoveHandler = this.handlePointerMove.bind(this);
        this.pointerDownHandler = this.handlePointerDown.bind(this);

        this.isPointerDownHeld = false;
    }

    public override set bounds(value: Bounds) {
        super.bounds = value;
    }

    public get inMoveMode(): boolean {
        return !this.currentMove;
    }

    public onMove(listener: MoveListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public subscribe(): void {
        this.htmlElement.addEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
    }

    public dispose(): void {
        this.unsubscribe();
        this.messaging.dispose();
    }

    private unsubscribe(): void {
        this.htmlElement.removeEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
    }

    private handlePointerUp(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        this.isPointerDownHeld = false;
        this.pointerDownHeldPosition = undefined;
        this.currentMove = undefined;
    }

    private handlePointerMove(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        const position = this.getPosition(event);

        if (this.isPointerDownHeld) {
            if (this.pointerDownHeldPosition) {
                const diffX = position.x - this.pointerDownHeldPosition.x;
                const diffY = position.y - this.pointerDownHeldPosition.y;

                const bounds = this.currentMove ?? super.bounds;

                const x = bounds.x + diffX;
                const y = bounds.y + diffY;

                if (Math.abs(bounds.x - x) > 5 || Math.abs(bounds.y - y) > 5 || this.currentMove) {
                    const newPosition = { x, y };
                    this.invokeMove(newPosition);
                    this.currentMove = newPosition;
                }
            }

            this.pointerDownHeldPosition = position;
        }
    }

    private handlePointerDown(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        this.isPointerDownHeld = true;
    }

    private invokeMove(position: Position): void {
        const event = { position };
        this.messaging.sendToChannel1(event);
    }

    private getPosition(event: PointerEvent): Position {
        const x = event.layerX;
        const y = event.layerY;
        return { x, y };
    }
}