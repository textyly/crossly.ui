import { Bounds } from "../types.js";
import { CanvasBase } from "../base.js";
import { Messaging2, Messaging3 } from "../../messaging/impl.js";
import { IMessaging2, IMessaging3 } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import {
    Position,
    MoveEvent,
    IMoveInput,
    ITouchInput,
    MoveListener,
    CanvasEventType,
    PointerEventHandler,
    MoveStartEvent,
    MoveStopEvent,
    MoveStartListener,
    MoveStopListener,
} from "./types.js";

export class MoveInput extends CanvasBase implements IMoveInput {
    private readonly messaging: IMessaging3<MoveStartEvent, MoveEvent, MoveStopEvent>;

    private readonly htmlElement: HTMLElement;
    private readonly touchInput: ITouchInput;

    private readonly pointerUpHandler: PointerEventHandler;
    private readonly pointerMoveHandler: PointerEventHandler;
    private readonly pointerDownHandler: PointerEventHandler;

    private lastDifference?: Position;
    private lastPointerPos?: Position;

    constructor(htmlElement: HTMLElement, touchInput: ITouchInput) {
        super();
        this.htmlElement = htmlElement;
        this.touchInput = touchInput;

        this.messaging = new Messaging3();

        this.pointerUpHandler = this.handlePointerUp.bind(this);
        this.pointerMoveHandler = this.handlePointerMove.bind(this);
        this.pointerDownHandler = this.handlePointerDown.bind(this);
    }

    public override set bounds(value: Bounds) {
        super.bounds = value;
    }

    public get inMoveMode(): boolean {
        return this.lastDifference !== undefined;
    }

    public onMoveStart(listener: MoveStartListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onMove(listener: MoveListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onMoveStop(listener: MoveStopListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
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

        const position = this.getPosition(event);
        this.stopMove(position);
    }

    private startMove(position: Position): void {
        this.lastPointerPos = position;
    }

    private move(currentPosition: Position): void {
        if (this.lastPointerPos) {
            // 1. calculate the diff between last pointer position and the current one
            const diffX = currentPosition.x - this.lastPointerPos.x;
            const diffY = currentPosition.y - this.lastPointerPos.y;

            // 2. check whether there is enough difference to start moving (filter out some small moving requests cause they might not be intended)
            const ignoreUntil = 10; // TODO: config
            const hasEnoughDiff = (ignoreUntil < Math.abs(diffX)) || (ignoreUntil < Math.abs(diffY));

            if (hasEnoughDiff || this.lastDifference) {
                const isMoveStarting = !this.lastDifference;
                const previousPosition = this.lastPointerPos;

                // 4. invoke canvas move
                const difference = { x: diffX, y: diffY };
                this.lastDifference = difference;
                this.lastPointerPos = currentPosition;

                if (isMoveStarting) {
                    this.invokeMoveStart(previousPosition, currentPosition);
                } else {
                    this.invokeMove(previousPosition, currentPosition);
                }
            }
        }
    }

    private stopMove(position: Position): void {
        const inMoveMode = this.inMoveMode;

        this.lastDifference = undefined;
        this.lastPointerPos = undefined;

        if (inMoveMode) {
            this.invokeMoveStop(position);
        }
    }

    private invokeMoveStart(previousPosition: Position, currentPosition: Position): void {
        const event = { previousPosition, currentPosition };
        this.messaging.sendToChannel1(event);
    }

    private invokeMove(previousPosition: Position, currentPosition: Position): void {
        const event = { previousPosition, currentPosition };
        this.messaging.sendToChannel2(event);
    }

    private invokeMoveStop(position: Position): void {
        const event = { position };
        this.messaging.sendToChannel3(event);
    }

    // TODO: extract in different class since more than one classes are using it
    private getPosition(event: PointerEvent): Position {
        const x = event.layerX;
        const y = event.layerY;
        return { x, y };
    }
}