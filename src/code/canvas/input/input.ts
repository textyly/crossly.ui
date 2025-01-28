import { Size } from "../types.js";
import { InputCanvasBase } from "./base.js";
import {
    CanvasEventsType,
    IInputCanvas,
    PointerEventHandler,
    Position,
    WheelChangeHandler
} from "./types.js";

export class InputCanvas extends InputCanvasBase implements IInputCanvas {
    private readonly htmlElement: HTMLElement;
    private readonly wheelChangeHandler: WheelChangeHandler;
    private readonly pointerMoveHandler: PointerEventHandler;
    private readonly pointerHoldingDownHandler: PointerEventHandler;
    private readonly pointerUpHandler: PointerEventHandler;

    constructor(htmlElement: HTMLElement) {
        super();

        this.htmlElement = htmlElement;

        this.wheelChangeHandler = this.handleWheelChange.bind(this);
        this.pointerMoveHandler = this.handlePointerMove.bind(this);
        this.pointerHoldingDownHandler = this.handlePointerHoldingDown.bind(this);
        this.pointerUpHandler = this.handlePointerUp.bind(this);

        this.subscribe();
    }

    public override set size(value: Size) {
        super.size = value;
        const width = value.width.toString();
        const height = value.height.toString();

        this.htmlElement.style.width = width + "px";
        this.htmlElement.style.height = height + "px";
    }

    public override dispose(): void {
        this.htmlElement.removeEventListener(CanvasEventsType.WheelChange, this.wheelChangeHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.PointerDown, this.pointerHoldingDownHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.PointerUp, this.pointerUpHandler);


        super.dispose();
    }

    private subscribe(): void {
        this.htmlElement.addEventListener(CanvasEventsType.WheelChange, this.wheelChangeHandler);
        this.htmlElement.addEventListener(CanvasEventsType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.addEventListener(CanvasEventsType.PointerDown, this.pointerHoldingDownHandler);
        this.htmlElement.addEventListener(CanvasEventsType.PointerUp, this.pointerUpHandler);

        this.htmlElement.addEventListener("touchmove", (e) => {

            const fingers = e.touches.length;
            console.log(`touch move with ${fingers} finger`);
            e.preventDefault();
        });

        this.htmlElement.addEventListener("touchstart", (e) => {
            const fingers = e.touches.length;
            console.log(`touch start with ${fingers} finger`);
            e.preventDefault();
        });

        this.htmlElement.addEventListener("touchend", (e) => {
            const fingers = e.touches.length;
            console.log(`touch end with ${fingers} finger`);
            e.preventDefault();
        });
    }

    private handleWheelChange(event: WheelEvent): void {
        if (event.ctrlKey) {
            const deltaY = event.deltaY;
            deltaY < 0 ? super.invokeZoomIn() : super.invokeZoomOut();
            event.preventDefault();
        }
    }

    private handlePointerMove(event: PointerEvent): void {
        const position = this.getPosition(event);
        super.invokePointerMove(position);
    }

    private handlePointerHoldingDown(event: PointerEvent): void {
        // TODO: create ticket
    }

    private handlePointerUp(event: PointerEvent): void {
        const position = this.getPosition(event);

        const leftButton = 0;
        if (event.button === leftButton) {
            super.invokePointerUp(position);
        }
    }

    private getPosition(event: PointerEvent | PointerEvent): Position {
        const rect = this.htmlElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }
}