import { MoveInputBase } from "./base.js";
import assert from "../../../asserts/assert.js";
import { Position, IMoveInput, ITouchInput, CanvasEventType, PointerEventHandler } from "../types.js";

export class MoveInput extends MoveInputBase implements IMoveInput {
    private readonly htmlElement: HTMLElement;
    private readonly touchInput: ITouchInput;
    private readonly ignoreMoveUntil: number;

    private readonly pointerUpHandler: PointerEventHandler;
    private readonly pointerMoveHandler: PointerEventHandler;
    private readonly pointerDownHandler: PointerEventHandler;
    private readonly pointerCancelHandler: PointerEventHandler;

    private lastDifference?: Position;
    private lastPointerPos?: Position;

    constructor(ignoreMoveUntil: number, htmlElement: HTMLElement, touchInput: ITouchInput) {
        super();

        this.ignoreMoveUntil = ignoreMoveUntil;
        assert.greaterThanZero(this.ignoreMoveUntil, "ignoreMoveUntil");

        this.htmlElement = htmlElement;
        assert.defined(this.htmlElement, "htmlElement");

        this.touchInput = touchInput;
        assert.defined(this.touchInput, "touchInput");

        this.pointerUpHandler = this.handlePointerUp.bind(this);
        this.pointerMoveHandler = this.handlePointerMove.bind(this);
        this.pointerDownHandler = this.handlePointerDown.bind(this);
        this.pointerCancelHandler = this.handlePointerCancel.bind(this);
    }

    public get inMoveMode(): boolean {
        super.ensureAlive();

        return this.lastDifference !== undefined;
    }

    public override dispose(): void {
        super.ensureAlive();
        this.unsubscribe();
        super.dispose();
    }

    private handlePointerDown(event: PointerEvent): void {
        super.ensureAlive();

        if (!this.touchInput.inZoomMode) {
            const position = this.getPosition(event);
            this.startMove(position);
        }
    }

    private handlePointerMove(event: PointerEvent): void {
        super.ensureAlive();

        if (!this.touchInput.inZoomMode) {
            const position = this.getPosition(event);
            this.move(position);
        }
    }

    private handlePointerUp(event: PointerEvent): void {
        super.ensureAlive();

        if (!this.touchInput.inZoomMode) {
            const position = this.getPosition(event);
            this.stopMove(position);
        }
    }

    private handlePointerCancel(event: PointerEvent): void {
        this.handlePointerUp(event);
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
            const hasEnoughDiff = (this.ignoreMoveUntil < Math.abs(diffX)) || (this.ignoreMoveUntil < Math.abs(diffY));

            if (hasEnoughDiff || this.lastDifference) {
                const isMoveStarting = !this.lastDifference;
                const previousPosition = this.lastPointerPos;

                // 3. invoke canvas move
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

    private getPosition(event: PointerEvent): Position {
        const x = event.layerX;
        const y = event.layerY;
        return { x, y };
    }

    public subscribe(): void {
        this.htmlElement.addEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerCancel, this.pointerCancelHandler);
    }

    private unsubscribe(): void {
        this.htmlElement.removeEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerCancel, this.pointerCancelHandler);
    }
}