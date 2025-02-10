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

    private invokeMove(difference: Position): void {
        const event = { difference };
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

            const lastCanvasPos = this.lastCanvasPos ?? super.bounds;

            // 3. check whether there is enough difference to start moving (filter some small moving request cause it might not be intended)
            const ignoreUntil = 1; // TODO: config
            const hasEnoughDiff = (ignoreUntil < Math.abs(diffX)) || (ignoreUntil < Math.abs(diffY));

            if (hasEnoughDiff || this.lastCanvasPos) {
                // 4. invoke canvas move
                const difference = { x: diffX, y: diffY };
                this.invokeMove(difference);
                this.lastCanvasPos = difference;
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