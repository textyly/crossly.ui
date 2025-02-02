import { Bounds } from "../types.js";
import { TouchInput } from "./touch.js";
import { InputCanvasBase } from "./base.js";
import {
    CanvasEventType,
    ITouchInput,
    PointerEventHandler,
    Position,
    WheelChangeHandler
} from "./types.js";

export class InputCanvas extends InputCanvasBase {
    private readonly htmlElement: HTMLElement;
    private readonly touchInput: ITouchInput;

    private readonly wheelChangeHandler: WheelChangeHandler;
    private readonly pointerMoveHandler: PointerEventHandler;
    private readonly pointerDownHandler: PointerEventHandler;
    private readonly pointerUpHandler: PointerEventHandler;

    private firstMove?: Position;
    private pointerDownHeldPosition?: Position;
    private isPointerDownHeld: boolean;

    constructor(htmlElement: HTMLElement) {
        super();

        this.htmlElement = htmlElement;
        this.touchInput = new TouchInput(htmlElement);

        this.wheelChangeHandler = this.handleWheelChange.bind(this);
        this.pointerMoveHandler = this.handlePointerMove.bind(this);
        this.pointerDownHandler = this.handlePointerDown.bind(this);
        this.pointerUpHandler = this.handlePointerUp.bind(this);

        this.isPointerDownHeld = false;

        this.subscribe();
    }

    public override set bounds(value: Bounds) {
        super.bounds = value;

        const width = ((window.innerWidth / 10) * 9.8) + "px"; //value.width.toString() + "px";
        const height = ((window.innerHeight / 10) * 9.3) + "px"; //value.height.toString() + "px";

        this.htmlElement.style.width = width;
        this.htmlElement.style.height = height;
    }

    public override dispose(): void {
        this.unsubscribe();
        this.touchInput.dispose();
        super.dispose();
    }

    private subscribe(): void {
        this.htmlElement.addEventListener(CanvasEventType.WheelChange, this.wheelChangeHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);

        const touchZoomInUn = this.touchInput.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(touchZoomInUn);

        const touchZoomOutUn = this.touchInput.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(touchZoomOutUn);
    }

    private unsubscribe(): void {
        this.htmlElement.removeEventListener(CanvasEventType.WheelChange, this.wheelChangeHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);
    }

    private handleWheelChange(event: WheelEvent): void {
        if (event.ctrlKey) {
            const deltaY = event.deltaY;
            deltaY < 0 ? this.handleZoomIn() : this.handleZoomOut();
            event.preventDefault();
        }
    }

    private handleZoomIn(): void {
        super.invokeZoomIn();
    }

    private handleZoomOut(): void {
        super.invokeZoomOut();
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

                const bounds = this.firstMove ?? super.bounds;

                const x = bounds.x + diffX;
                const y = bounds.y + diffY;

                if (Math.abs(bounds.x - x) > 5 || Math.abs(bounds.y - y) > 5 || this.firstMove) {
                    const newPosition = { x, y };
                    super.invokeMove(newPosition);
                    this.firstMove = newPosition;
                }
            }

            this.pointerDownHeldPosition = position;
        }

        super.invokePointerMove(position);
    }

    private handlePointerDown(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        this.isPointerDownHeld = true;
    }

    private handlePointerUp(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        if (!this.pointerDownHeldPosition) {
            const position = this.getPosition(event);
            const leftButton = 0;
            if (event.button === leftButton) {
                super.invokePointerUp(position);
            }
        }

        this.isPointerDownHeld = false;
        this.pointerDownHeldPosition = undefined;
        this.firstMove = undefined;
    }

    private getPosition(event: PointerEvent): Position {
        const x = event.layerX;
        const y = event.layerY;
        return { x, y };
    }
}