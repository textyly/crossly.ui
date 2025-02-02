import { Bounds } from "../types.js";
import { CanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import {
    Position,
    MoveEvent,
    IMoveInput,
    ITouchInput,
    MoveListener,
    CanvasEventType,
    PointerEventHandler,
} from "./types.js";

export class MoveInput extends CanvasBase implements IMoveInput {
    private readonly messaging: IMessaging1<MoveEvent>;

    private readonly htmlElement: HTMLElement;
    private readonly touchInput: ITouchInput;

    private readonly pointerUpHandler: PointerEventHandler;
    private readonly pointerMoveHandler: PointerEventHandler;
    private readonly pointerDownHandler: PointerEventHandler;

    private lastCanvasPos?: Position;
    private lastPointerPos?: Position;

    constructor(htmlElement: HTMLElement, touchInput: ITouchInput) {
        super();
        this.htmlElement = htmlElement;
        this.touchInput = touchInput;

        this.messaging = new Messaging1();

        this.pointerUpHandler = this.handlePointerUp.bind(this);
        this.pointerMoveHandler = this.handlePointerMove.bind(this);
        this.pointerDownHandler = this.handlePointerDown.bind(this);
    }

    public override set bounds(value: Bounds) {
        super.bounds = value;
    }

    public get inMoveMode(): boolean {
        return !this.lastCanvasPos;
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

    private handlePointerDown(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        const position = this.getPosition(event);
        this.startMove(position);
    }

    private handlePointerMove(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        const position = this.getPosition(event);
        this.move(position);
    }

    private handlePointerUp(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        this.stopMove();
    }

    private invokeMove(position: Position): void {
        const event = { position };
        this.messaging.sendToChannel1(event);
    }

    private startMove(position: Position): void {
        this.lastPointerPos = position;
    }

    private move(position: Position): void {
        if (this.lastPointerPos) {
            // 1. calculate the diff between last pointer position and the current one
            const diffX = position.x - this.lastPointerPos.x;
            const diffY = position.y - this.lastPointerPos.y;

            const pos = this.lastCanvasPos ?? super.bounds;

            // 2. calculate the new canvas position
            const x = Math.abs(pos.x + diffX);
            const y = Math.abs(pos.y + diffY);

            // 3. check whether there is enough difference to start moving (filter some small moving request cause it might not be intended)
            const ignoreUntil = 5; // TODO: config
            const hasEnoughDiff = (ignoreUntil < x) || (ignoreUntil < y);

            if (hasEnoughDiff || this.lastCanvasPos) {

                // 4. invoke canvas move
                const newPosition = { x, y };
                this.invokeMove(newPosition);
                this.lastCanvasPos = newPosition;
            }
            this.lastPointerPos = position;
        }
    }

    private stopMove(): void {
        this.lastCanvasPos = undefined;
        this.lastPointerPos = undefined;
    }

    // TODO: extract in different class since more than one classes are using it
    private getPosition(event: PointerEvent): Position {
        const x = event.layerX;
        const y = event.layerY;
        return { x, y };
    }
}